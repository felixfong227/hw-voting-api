import { Logger } from "@nestjs/common";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { isNil } from "lodash";

const listOfValidHKIDPrefixes = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "P",
  "R",
  "S",
  "T",
  "V",
  "W",
  "Y",
  "Z",
  "WX",
  "XA",
  "XB",
  "XC",
  "XD",
  "XE",
  "XG",
  "XH",
];

@ValidatorConstraint({ name: "isHKID", async: false })
export class IsHKID implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    try {
      if (isNil(text)) return false;
      if (text.length < 8) return false;
      const regex = /(^\w\d|^\w\w)(\d)+\((\w|\d)\)/;
      const result = regex.test(text);

      let foundPrefix = false;
      for (const prefix of listOfValidHKIDPrefixes) {
        if (text.startsWith(prefix)) {
          foundPrefix = true;
          break;
        }
      }
      if (!foundPrefix) return false;

      if (result === false) return false;
      return this.validCheckDigit(text);
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }

  validCheckDigit(str: string) {
    const strValidChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // handling bracket
    if (str.charAt(str.length - 3) == "(" && str.charAt(str.length - 1) == ")")
      str = str.substring(0, str.length - 3) + str.charAt(str.length - 2);

    // convert to upper case
    str = str.toUpperCase();

    // regular expression to check pattern and split
    const hkidPat = /^([A-Z]{1,2})([0-9]{6})([A0-9])$/;
    const matchArray = str.match(hkidPat);

    // not match, return false
    if (matchArray == null) return false;

    // the character part, numeric part and check digit part
    const charPart = matchArray[1];
    const numPart = matchArray[2];
    const checkDigit = matchArray[3];

    // calculate the checksum for character part
    let checkSum = 0;
    if (charPart.length == 2) {
      checkSum += 9 * (10 + strValidChars.indexOf(charPart.charAt(0)));
      checkSum += 8 * (10 + strValidChars.indexOf(charPart.charAt(1)));
    } else {
      checkSum += 9 * 36;
      checkSum += 8 * (10 + strValidChars.indexOf(charPart));
    }

    // calculate the checksum for numeric part
    for (let i = 0, j = 7; i < numPart.length; i++, j--)
      checkSum += j * parseInt(numPart.charAt(i));

    // verify the check digit
    const remaining = checkSum % 11;
    const verify = remaining == 0 ? 0 : 11 - remaining;
    console.log(verify)

    return (
      verify === parseInt(checkDigit) || (verify == 10 && checkDigit == "A")
    );
  }

  defaultMessage(args: ValidationArguments) {
    return "Malformed HKID";
  }
}
