import { Logger } from "@nestjs/common";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import dayjs from "dayjs";
import { isNil } from "lodash";

@ValidatorConstraint({ name: "isExpireDateBeforeToday", async: false })
export class isExpireDateBeforeToday implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments) {
    if (isNil(value)) throw new Error("Date value cannot be nil");
    try {
      const inputExpireDate = dayjs(value);
      const now = dayjs();
      // check if the user input date is a valid one
      if (!inputExpireDate.isValid()) return false;
      // check expire date is before today, which does not make any sense
      console.log(inputExpireDate.toDate(), now.toDate());
      if (inputExpireDate.isBefore(now)) return false;
      return true;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "Invalid date, expire date must be before today";
  }
}

@ValidatorConstraint({ name: "IsExpireDateInRange", async: false })
export class IsExpireDateInRange implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments) {
    if (isNil(value)) return false;
    try {
      const inputExpireDate = dayjs(value);
      // check if the user input date is a valid one
      if (!inputExpireDate.isValid()) return false;
      const maxAllowedExpireDate = dayjs().add(1, "week");
      // check if the user input expire date is less a week starting from today
      return inputExpireDate.isBefore(maxAllowedExpireDate);
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "Invalid date, expire date must be less then a week starting from today";
  }
}
