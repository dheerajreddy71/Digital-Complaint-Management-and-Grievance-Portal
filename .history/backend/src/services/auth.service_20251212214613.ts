import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import {
	UserRepository,
	RefreshTokenRepository,
	AuditLogRepository,
} from "../repositories";
import {
	CreateUserDto,
	LoginDto,
	AuthResponse,
	UserResponse,
	TokenPayload,
} from "../models";
import { logger } from "../utils";

export class AuthService {
	private userRepo = new UserRepository();
	private tokenRepo = new RefreshTokenRepository();
	private auditRepo = new AuditLogRepository();

	// Register new user
	async register(
		data: CreateUserDto,
		ipAddress?: string
	): Promise<AuthResponse> {
		// Check if email already exists
		if (await this.userRepo.emailExists(data.email)) {
			throw new Error("Email already registered");
		}

		// Validate role-specific requirements
		if (data.role === "Staff" && !data.expertise) {
			throw new Error("Staff members must specify their expertise");
		}

		const user = await this.userRepo.create(data);

		// Generate tokens
		const accessToken = this.generateAccessToken(user);
		const refreshToken = await this.generateRefreshToken(user.id);

		// Log the registration
		await this.auditRepo.create({
			user_id: user.id,
			action: "USER_REGISTERED",
			entity_type: "User",
			entity_id: user.id,
			ip_address: ipAddress,
		});

		logger.info(`User registered: ${user.email}`);

		return { user, accessToken, refreshToken };
	}

	// Login with email and password
	async login(data: LoginDto, ipAddress?: string): Promise<AuthResponse> {
		const user = await this.userRepo.findByEmail(data.email);

		if (!user) {
			throw new Error("Invalid email or password");
		}

		const isValidPassword = await bcrypt.compare(data.password, user.password);
		if (!isValidPassword) {
			throw new Error("Invalid email or password");
		}

		// Strip password from response
		const { password, updated_at, ...userResponse } = user;

		// Generate tokens
		const accessToken = this.generateAccessToken(userResponse);
		const refreshToken = await this.generateRefreshToken(user.id);

		// Log the login
		await this.auditRepo.create({
			user_id: user.id,
			action: "USER_LOGIN",
			entity_type: "User",
			entity_id: user.id,
			ip_address: ipAddress,
		});

		logger.info(`User logged in: ${user.email}`);

		return { user: userResponse, accessToken, refreshToken };
	}

	// Refresh access token using refresh token
	async refreshToken(
		token: string
	): Promise<{ accessToken: string; refreshToken: string }> {
		const tokenData = await this.tokenRepo.findByToken(token);

		if (!tokenData) {
			throw new Error("Invalid refresh token");
		}

		// Check if expired
		if (new Date(tokenData.expires_at) < new Date()) {
			await this.tokenRepo.delete(token);
			throw new Error("Refresh token expired");
		}

		const user = await this.userRepo.findById(tokenData.user_id);
		if (!user) {
			throw new Error("User not found");
		}

		// Delete old token and create new one
		await this.tokenRepo.delete(token);

		const { password, updated_at, ...userResponse } = user;
		const accessToken = this.generateAccessToken(userResponse);
		const refreshToken = await this.generateRefreshToken(user.id);

		return { accessToken, refreshToken };
	}

	// Logout - invalidate refresh token
	async logout(refreshToken: string): Promise<void> {
		await this.tokenRepo.delete(refreshToken);
	}

	// Logout from all devices
	async logoutAll(userId: number): Promise<void> {
		await this.tokenRepo.deleteAllForUser(userId);
	}

	// Verify access token and return payload
	verifyAccessToken(token: string): TokenPayload {
		try {
			return jwt.verify(token, config.jwt.secret) as TokenPayload;
		} catch {
			throw new Error("Invalid or expired token");
		}
	}

	// Generate access token (30 min as per spec)
	private generateAccessToken(user: UserResponse): string {
		const payload: Omit<TokenPayload, "iat" | "exp"> = {
			userId: user.id,
			email: user.email,
			role: user.role,
		};

		return jwt.sign(payload, config.jwt.secret, {
			expiresIn: config.jwt.expiresIn,
		});
	}

	// Generate refresh token (7 days as per spec)
	private async generateRefreshToken(userId: number): Promise<string> {
		const token = jwt.sign({ userId }, config.jwt.refreshSecret, {
			expiresIn: config.jwt.refreshExpiresIn,
		});

		// Calculate expiry date
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		await this.tokenRepo.save(userId, token, expiresAt);

		return token;
	}
}
