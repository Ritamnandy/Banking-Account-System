
export enum AccountType
{
    SAVINGS = 'SAVINGS',
    CHECKING = 'CHECKING',
    CREDIT = 'CREDIT',
    LOAN = 'LOAN'
}

const generateAccountNumber = () =>
{
    return Math.floor( Math.random() * 1000000000 ).toString();
};

export { generateAccountNumber };
