import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    const cleanPassword =
      typeof password === "string" ? password : "";

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        role: "admin",
      },
    });

    if (!admin || !admin.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(
      cleanPassword,
      admin.password
    );

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured.");

      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error.",
        },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        role: admin.role,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}