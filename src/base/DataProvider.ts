import * as lodash from 'lodash';
import BaseObject from './BaseObject';
import Model from './Model';
import Pagination from './Pagination';

// 分页器类,主要是来解决分页的问题
export default class DataProvider extends BaseObject {

    get sort(): string|object {
        const arr = [];
        if (lodash.isEmpty(this._sort)) {
            this._sort = {};
        }
        Object.keys(this._sort).forEach(key => {
            const value = this._sort[key];
            if (value === DataProvider.SORT_DESC) {
                arr.push('-' + key);
            } else {
                arr.push(key);
            }
        });
        return arr.join(',');
    }

    set sort(sort: string|object) {
        if (typeof (sort) === 'string') {
            const arr = sort.split(',');
            this._sort = {};
            Object.keys(arr).forEach(i => {
                const str = arr[i];
                if (str.slice(0, 1) === '-') {
                    const temp = str.slice(1, str.length);
                    this._sort[temp] = DataProvider.SORT_DESC;
                } else {
                    this._sort[str] = DataProvider.SORT_ASC;
                }
            });
        }

        if (typeof (sort) === 'object') {
            this._sort = sort;
        }
    }
    public static SORT_ASC = 4;
    public static SORT_DESC = 3;

    public static getInstance(data: object, searchModelClass: any = Model, modelClass: any = Model, paginationClass: any = Pagination): DataProvider {
        const config =  {
            data,
            searchModelClass,
            modelClass,
            paginationClass,
        };
        return new DataProvider(config);
    }
    public searchModel: Model;
    public pager: Pagination;
    public models: Model[];
    public isLoad: boolean = false;
    public modelClass: any;
    public searchModelClass: any;
    public paginationClass: any;

    private _sort: object;

    constructor(config: object) {
        super();
        this.searchModelClass = lodash.get(config, 'searchModelClass', Model);
        this.modelClass = lodash.get(config, 'modelClass', Model);
        this.paginationClass = lodash.get(config, 'paginationClass', Pagination);

        this.searchModel = lodash.get(config, 'searchModel', '');
        if (lodash.isEmpty(this.searchModel)) {
            this.searchModel = new this['searchModelClass']();
        }
        this.pager = lodash.get(config, 'pager', '');
        if (lodash.isEmpty(this.pager)) {
            this.pager = new this['paginationClass']();
        }
        this.sort = lodash.get(config, 'sort', '');
        const data = lodash.get(config, 'data', {});
        this.load(data);
    }

    // 切换排序方式
    public toggleSort() {
        Object.keys(this._sort).forEach(key => {
            const value = this._sort[key];
            if (value === DataProvider.SORT_DESC) {
                this._sort[key] = DataProvider.SORT_ASC;
            } else if (value === DataProvider.SORT_ASC) {
                this._sort[key] = DataProvider.SORT_DESC;
            }
        });
    }

    // 如果不传参则获取当前的url, params的传参会优先
    public getParams(args: object = {}) {
        const params = {};
        Object.keys(this.searchModel).forEach(key => {
            params[key] = this.searchModel[key];
        });
        params['page'] = this.pager.currentPage;
        params['per-page'] = this.pager.perPage;
        params['sort'] = this.sort;
        Object.keys(args).forEach(key => {
            params[key] = args[key];
        });
        return params;
    }

    public load(data: object, append: boolean = false, primaryKey: string = '') {
        const params = lodash.get(data, 'params', {});
        if (!this.isLoad) {
            const searchModel = new this['searchModelClass']();
            searchModel.load(params);
            this.searchModel = searchModel;
        } else {
            this.searchModel = this.searchModel.load(params);
        }
        const meta = lodash.get(data, 'meta', {});
        this.pager = this.pager.load(meta);
        this.sort = lodash.get(data, 'sort', '');

        let models = this.models;
        if (lodash.isEmpty(models) || !append) {
            models = [];
        }
        const items = lodash.get(data, 'items', []);
        const modelDict = {};
        // 如果设置了primaryKey，则按primaryKey进行去重
        if (!lodash.isEmpty(primaryKey)) {
            Object.keys(models).forEach(key => {
                const tempModel = models[key];
                if (tempModel.hasOwnProperty(primaryKey)) {
                    modelDict[tempModel[primaryKey]] = key;
                }
            });
        }
        Object.keys(items).forEach(key => {
            const item = items[key];
            const model = new this.modelClass();
            model.load(item);
            if (!lodash.isEmpty(primaryKey) && model.hasOwnProperty(primaryKey)) {
                if (modelDict.hasOwnProperty(model[primaryKey])) {
                    const tempKey = modelDict[model[primaryKey]];
                    models[tempKey] = model;
                } else {
                    modelDict[model[primaryKey]] = models.length;
                    models.push(model);
                }
            } else {
                models.push(model);
            }
        });
        this.models = models;
        this.isLoad = true;
        this.init();
        return this;
    }

    public remove(index: string|number|object = 0) {
        if (typeof index === 'string') {
            index = parseInt(index, 0);
        }
        if (typeof index === 'number') {
            return this.models.splice(index, 1);
        }
        let value = null;
        Object.keys(this.models).forEach(key => {
            if (index === this.models[key]) {
                value = this.remove(key);
            }
        });
        return value;
    }

    public sortModels(attribute: string, asc: boolean = true, sortBy: any = null) {
        if (sortBy === null) {
            sortBy =  (value1, value2, sortType) => {
                if (value1 === value2) {
                    return 0;
                }
                if (sortType)  {
                    return value1 > value2 ? 1 : -1;
                }
                return value1 < value2 ? 1 : -1;
            };
        }
        const compare = (a, b) => sortBy(a[attribute], b[attribute], asc);
        this.models.sort(compare);
    }
}
