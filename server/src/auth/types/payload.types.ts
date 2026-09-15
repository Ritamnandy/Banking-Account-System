import type { Role } from "../../Types/types.js";

type JwtPayLoad = {
    id: string;
    role: Role
    email: string;
    firstName: string;
    lastName: string;
};

type RefreshTokenPayload = {
    id: string;
    email: string;
};

export type { JwtPayLoad, RefreshTokenPayload };