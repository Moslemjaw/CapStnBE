import { Request } from "express";

export interface userType {
  id: string;
  role?: string;
}

export interface customRequestType extends Request {
  user?: userType;
}

export interface customResponseType {
  user: userType;
}
