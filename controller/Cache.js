
class CacheControll {
    static _Instance  = undefined;
    _Id_count  = 0;
    _Cache     = {}
    _CallBacks = {}
    
    static Get(){
        if(!CacheControll._Instance){
            CacheControll._Instance = new CacheControll();
        }
        return CacheControll._Instance;
    }

    
    addObject(key = "",obj = undefined){
        this._Cache[key] = obj;
        this._call_listners()
    }
    
    remObject(key = ""){
        delete this._Cache[key];
        this._call_listners()
    }

    addListner(_callback){
        
        const t_id = this._Id_count
        ++this._Id_count;

        this._CallBacks[t_id] = _callback
        return t_id
    }

    remListner(){
        delete this._CallBacks[t_id]
    }

    async _call_listners(){
        const copy_cache = this._Cache
        const copy_callbacks = this._CallBacks

        for(let i in copy_callbacks) {
            copy_callbacks[i](copy_cache)
        }
    }
}

module.exports = CacheControll