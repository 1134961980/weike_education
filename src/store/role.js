import http from "../utils/http.js"

export default {
        namespaced: true,
        state:{
                roles:[],
                isInit: false
        },
        mutations:{
                _init(state, roles) {
                        state.roles = roles;
                        state.isInit = true
                },
                _removeRole(state, role_id) {
                        let index=state.roles.findIndex(item=>item.role_id === role_id)
                        state.roles.splice(index,1);
                },
                _roleAdd(state, model) {
                        state.roles.push(model);
                },
                _updateRole(state, model) {
                        let index = state.roles.findIndex(item => item.role_id === model.role_id)
                        state.roles.splice(index, 1,  model)
                }
        },
        actions:{
                async init(context) {
                        if(context.state.isInit) return;
                        let roles = await  http({url: "/role/all"})
                        context.commit("_init", roles)
                },
                async  removeRole(context, role_id){
                        await  http({
                                url:"/role/remove/"+role_id,
                                method: "post"
                        });
                        context.commit("_removeRole",role_id )
                } ,
                async  roleAdd(context,model) {
                        model.role_id=await http({
                                url: "/role/add",
                                method: "post",
                                data: {
                                        role_name : model.role_name
                                }
                        })
                        context.commit("_roleAdd", model)
                },
                async  updateRole(context, model) {
                        await http({
                                url: "/role/update",
                                method: "post",
                                data: {
                                        role_id: model.role_id,
                                        role_name: model.role_name
                                }
                        });
                        context.commit("_updateRole", model)
                }
        }
}