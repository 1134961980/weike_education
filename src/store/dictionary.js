
export default {
        namespaced: true,
        state: {
                isInit: false,
                dictionary: [],
        },
        getters: {
             getGroupByKey(state){
                     return function(groupKey){
                             return state.dictionary.filter(item => item.dic_group_key === groupKey)
                     }
             }
        },
        mutations: {
                _init(state,dictionary){
                       state.dictionary = dictionary;
                     state.isInit = true;
                }
        },
        actions: {
                async init({state, commit, rootState}) {
                        if(state.isInit) return;
                        let dictionary = await  rootState.http({url: "/dictionary/all"});
                    commit("_init", dictionary)
                }
        }
};