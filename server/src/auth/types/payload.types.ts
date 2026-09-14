
type JwtPayLoad = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
};

type RefreshTokenPayload = {
    id: string;
    email: string;
};

export type { JwtPayLoad, RefreshTokenPayload };