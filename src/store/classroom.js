import http from "../utils/http.js";

export default {
   namespaced: true,
   state:{
           isInit: false,
           classrooms:[]
   },
   mutations: {
           _init(state, list){
                 state.classrooms = list;
                 state.isInit = true
           },
           _removeClsr(state, id){
                   let index=state.classrooms.findIndex(item=>item.clsr_id=== id)
                   state.classrooms.splice(index,1);
           },
           _clsrAdd(state, model) {
                   state.classrooms.push(model)
           },
           _updateClsr(state,model){
                   let index=state.classrooms.findIndex(item=>item.clsr_id=== model.clsr_id)
                   state.classrooms.splice(index,1,model)
           },
           useClsr(state,id){
                   state.classrooms.find(item => item.clsr_id === id).clsr_occupy = 1;
           }
   },
   actions: {
          async init(context){
                  if(context.state.isInit) return;
                  let list = await http({url:"/classroom/all"});
                  context.commit("_init", list)
           },
           async removeClsr(context,id){
                   await http({url: "/classroom/remove/"+ id});
                   context.commit("_removeClsr",id)
           },
           async clsrAdd(context, model){
                   model.clsr_id=await http({
                           url: "/classroom/add",
                           method: "post",
                           data: model
                   })
                   context.commit("_clsrAdd", model)
           },
           async updateClsr(context,model) {
                   await http({
                           url: "/classroom/update",
                           method: "post",
                           data: model
                   });
                   context.commit("_updateClsr",model)
           }
   }
};