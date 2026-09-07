type WellcomeMail = {
    email: string;
    name: string;
};

type VerifyEmail = {
    email: string;
    otp: string;
};

type ResetPassword = {
    email: string;
    link: string;
};

type ChangedPasswordConfirmation = {
    email: string;
};

export type {
    WellcomeMail,
    VerifyEmail,
    ResetPassword,
    ChangedPasswordConfirmation,
};