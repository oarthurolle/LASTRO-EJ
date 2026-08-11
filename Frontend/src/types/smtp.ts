export interface SmtpConfig {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  fromName: string | null;
  fromAddress: string;
  contactRecipient: string | null;
  auth: boolean;
  starttls: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SmtpConfigInput {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromAddress: string;
  contactRecipient: string;
  auth: boolean;
  starttls: boolean;
}

export type SmtpConfigDraft = Omit<SmtpConfigInput, "port"> & {
  port: string;
};