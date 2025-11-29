import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

// 📝 Register - Registrar nuevo usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password) {
      res.status(400).json({
        error: "Validation error",
        message: "Username, email, and password are required",
      });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(409).json({
        error: "User already exists",
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
      return;
    }

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password,
      status: "offline",
    });

    await newUser.save();

    // Generar token JWT
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    // Respuesta sin password
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      // Errores de validación de Mongoose
      if (error.name === "ValidationError") {
        res.status(400).json({
          error: "Validation error",
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Error registering user",
    });
  }
};

// 🔐 Login - Iniciar sesión
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      res.status(400).json({
        error: "Validation error",
        message: "Email and password are required",
      });
      return;
    }

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid email or password",
      });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        error: "Authentication failed",
        message: "Invalid email or password",
      });
      return;
    }

    // Actualizar status a online
    user.status = "online";
    user.lastSeen = new Date();
    await user.save();

    // Generar token JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Respuesta sin password
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error during login",
    });
  }
};

// 👤 Get Profile - Obtener perfil del usuario autenticado
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    // Buscar usuario por ID del token
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      res.status(404).json({
        error: "User not found",
        message: "User does not exist",
      });
      return;
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Error retrieving profile",
    });
  }
};

