import Model from '../base/Model';
import BaseHelper from '../helpers/BaseHelper';
import Validator from './Validator';

export default class UrlValidator extends Validator {
    public validateAttribute(model: Model): void {
        const attribute = this.attribute;
        const options: any = this.options;
        let value = model[attribute];
        if (options.pattern && typeof (options.pattern) === 'string') {
            options.pattern = new RegExp(options.pattern);
        }
        if (options.skipOnEmpty && BaseHelper.isEmpty(value)) {
            return;
        }

        if (options.defaultScheme && !/:\/\//.test(value)) {
            value = options.defaultScheme + '://' + value;
        }

        const valid = true;

        /* if (options["enableIDN"]) {
            let matches = /^([^:]+):\/\/([^\/]+)(.*)$/.exec(value);
            if (matches === null) {
                valid = false;
            } else {
                value = matches[1] + '://' + punycode.toASCII(matches[2]) + matches[3];
            }
        }*/

        if (!valid || !options.pattern.test(value)) {
            model.addError(attribute, options.message);
        }

    }
}
