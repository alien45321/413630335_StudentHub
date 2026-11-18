import { Contorller } from "../abstract/Contorller";
import {Request, Response} from "express";
import { logger } from "../middlewares/log";
import { Service } from "../abstract/Service";
import { PageService } from "../Service/PageService";
import { resolve } from "node:path";
require('dotenv').config()

export class PageController extends Contorller {
  protected service: Service;

  constructor(){
    super();
    this.service = new PageService();
  }

  public sendPage(Request:Request, Response:Response){
    Response.sendFile(resolve(process.env.HomePagePath ?? '../FrontEndExample/dist/index.html'))
  }
}
