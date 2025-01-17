import Model from '../base/Model';
import BaseHelper from '../helpers/BaseHelper';
import Validator from './Validator';

export default class DictValidator extends Validator {
    public validateAttribute(model: Model): void {
        const attribute = this.attribute;
        const options: any = this.options;
        let value = model[attribute];
        if (options.skipOnEmpty && BaseHelper.isEmpty(value)) {
            return;
        }

        if (!options.multiple) {
            value = [value];
        }

        if (typeof value !== 'object') {
            model.addError(attribute, options.message);
            return;
        }

        if (options.min !== undefined && value.length < options.min) {
            model.addError(attribute, options.tooSmall);
        }
        if (options.max !== undefined && value.length > options.max) {
            model.addError(attribute, options.tooMuch);
        }
        Object.keys(value).forEach(index => {
            const val = value[index];
            if ( (!options.list.hasOwnProperty(val)) || options.excludes.indexOf(val) > -1) {
                model.addError(attribute, options.message);
            }
        });
    }
}
