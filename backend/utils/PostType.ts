import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'postType', async: false })
export class PostType implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return (
      text.toLowerCase() === 'geral' ||
      text.toLowerCase() === 'eventos' ||
      text.toLowerCase() === 'avisos' ||
      text.toLowerCase() === 'aulas'
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'Tipo de publicação deve ser Geral, Eventos, Avisos ou Aulas.';
  }
}
