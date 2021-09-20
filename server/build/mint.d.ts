export interface mintParams {
    id: string;
    type: 'NFT' | 'FT';
    amount: number;
    name: string;
    description: string;
    author: string;
    symbol: string;
    payment: string;
    file: string;
    addr: string;
    price: number;
    paid: boolean;
}
export declare function mint({ type, name, description, author, file, amount, addr }: mintParams): Promise<void>;
