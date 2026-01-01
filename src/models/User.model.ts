import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type UserType = "email" | "github";

export interface IUser {
    email: string;
    password?: string;
    name: string;
    avatar?: string;

    userType: UserType;

    githubId?: string;
    githubUsername?: string;
    githubAccessToken?: string;
    githubRefreshToken?: string;

    emailVerified: boolean;

    passwordResetToken?: string;
    passwordResetExpires?: Date;

    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser, IUserMethods>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            minlength: 6,
            select: false,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        avatar: {
            type: String,
            default: "https://ui-avatars.com/api/?name=User",
        },

        userType: {
            type: String,
            enum: ["email", "github"],
            default: "email",
            required: true,
        },

        githubId: {
            type: String,
            unique: true,
            sparse: true,
        },

        githubUsername: String,
        githubAccessToken: String,
        githubRefreshToken: String,

        emailVerified: {
            type: Boolean,
            default: false,
        },

        passwordResetToken: String,
        passwordResetExpires: Date,

        lastLogin: Date,
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                delete ret.password;
                return ret;
            },
        },
    }
);

/* =======================
   Indexes
======================= */

UserSchema.index({ email: 1 });
UserSchema.index({ githubId: 1 });

/* =======================
   Middleware
======================= */

UserSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;

    this.password = await bcrypt.hash(this.password, 12);
});

/* =======================
   Instance Methods
======================= */

UserSchema.methods.comparePassword = async function (
    candidatePassword: string
) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

export const User =
    mongoose.models.User ||
    mongoose.model<IUser>("User", UserSchema);
