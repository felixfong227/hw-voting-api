import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { isNil } from "lodash";
import { MissingRequestParams } from "src/Errors";
import { ApiSingleErrorResponse } from "src/Swagger/Types";
import { CreateNewUserDTO, CreateNewUserResponse } from "./createNewUser.dto";
import { GetOneUserDetailsResponse } from "./dto/Users";
import { UserService } from "./user.service";

class GetOneUserParam {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform((value) => value.trim())
  id: string;
}

@Controller("users")
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get("/:id")
  @ApiTags("Users")
  @ApiNotFoundResponse({
    description: "User not found",
    type: ApiSingleErrorResponse,
  })
  @ApiInternalServerErrorResponse({
    description: "Internal server error :(",
  })
  @ApiOkResponse({
    description: "Get a user details, including all the campaigns, votes",
    type: GetOneUserDetailsResponse,
  })
  async getOneUserInfo(@Param() params: GetOneUserParam) {
    const { id } = params;
    if (isNil(id)) {
      throw new MissingRequestParams();
    }
    const result = await this.usersService.getOneUser(id);
    return result;
  }

  @Post("/create")
  @ApiTags("Users")
  @ApiCreatedResponse({
    description: "Successfully created a new user",
    type: CreateNewUserResponse,
  })
  @ApiBadRequestResponse({
    description: "User already exists",
    type: ApiSingleErrorResponse,
  })
  @ApiInternalServerErrorResponse({
    description: "Internal server error :(",
  })
  async createNewUser(
    @Body() body: CreateNewUserDTO
  ): Promise<CreateNewUserResponse> {
    const { HKID } = body;
    const newUserRecord = await this.usersService.createNewUser(HKID);
    return newUserRecord;
  }
}
