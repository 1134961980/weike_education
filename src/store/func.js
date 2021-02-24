import  http from "../utils/http.js";
export  default {
  namespaced: true,
  state: {
          list: [],
          isInit:false
  },
  mutations:{
          _init(state, list) {
                  state.list = list;
                  state.isInit = true
          },
          _removeFunc(state,func_id) {
                  let index=state.list.findIndex(item=>item.func_id=== func_id)
                  state.list.splice(index,1);
          },
          _beginAdd(state,model) {
                  state.list.push(model)
          },
          _updateFunc(state,model){
                  let index=state.list.findIndex(item=>item.func_id=== model.func_id)
                  state.list.splice(index,1,model)
          }
  },
   actions: {
           async init(context) {
                   if(context.state.isInit) return;
                   let list = await  http({ url: "/function/all"})
                 context.commit("_init", list)
           },
           async removeFunc(context,func_id) {
                   await http({
                           url: "/function/remove/"+ func_id,
                           method: "post"
                   });
                   context.commit("_removeFunc",func_id)
           },
           async beginAdd(context,model) {
                   model.func_id=await http({
                           url: "/function/add",
                           method: "post",
                           data: model
                   })
                   context.commit("_beginAdd", model)
           },
           async updateFunc(context,model) {
                   await http({
                           url: "/function/update",
                           method: "post",
                           data: model
                   });
                   context.commit("_updateFunc",model)
           }
    },
    getters: {
          listToTree(state){
                  let result = [];
                  state.list.filter(item => item.func_fid === 0).forEach(item =>{
                          let node = Object.assign({}, item);
                          let children = state.list.filter(func => func.func_fid === item.func_id);
                          if(children.length > 0){
                                  node.children = [];
                                  children.forEach(func => node.children.push(Object.assign({}, func)))
                          }
                          result.push(node);
                  });
                  return result;
          },

          }
};

