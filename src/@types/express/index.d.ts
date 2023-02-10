import { iProjectRequest } from "../../interfaces/projects.interfaces";
import * as express from 'express'

declare global {
    namespace Express {
      interface Request {
        validatedProjectRequest: iProjectRequest;
        validatedUpdateProjectRequest: Partial<iProjectRequest>
      }
    }
  }