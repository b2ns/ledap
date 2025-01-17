import Model from '../base/Model';
import BaseHelper from '../helpers/BaseHelper';
import Validator from './Validator';

export default class CompareValidator extends Validator {
    public validateAttribute(model: Model): void {
        const attribute = this.attribute;
        const options: any = this.options;
        let value = model[attribute];
        if (options.skipOnEmpty && BaseHelper.isEmpty(value)) {
            return;
        }

        let compareValue;
        let valid = true;
        if (options.compareAttribute === undefined) {
            compareValue = options.compareValue;
        } else {
            compareValue = model[options.compareAttribute];
        }

        if (options.type === 'number') {
            value = parseFloat(value);
            compareValue = parseFloat(compareValue);
        }
        /* eslint-disable eqeqeq */
        switch (options.operator) {
            case '==':
                valid = value == compareValue;
                break;
            case '===':
                valid = value === compareValue;
                break;
            case '!=':
                valid = value != compareValue;
                break;
            case '!==':
                valid = value !== compareValue;
                break;
            case '>':
                valid = value > compareValue;
                break;
            case '>=':
                valid = value >= compareValue;
                break;
            case '<':
                valid = value < compareValue;
                break;
            case '<=':
                valid = value <= compareValue;
                break;
            default:
                valid = false;
                break;
        }

        if (!valid) {
            model.addError(value, options.message);
        }

    }
}
