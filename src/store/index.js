import Vue from "vue";
import Vuex from "vuex";
import http from "../utils/http.js"
import  func from  "./func.js";
import  role  from  "./role.js";
import  classroom from  "./classroom.js";
import  dictionary from  "./dictionary.js";

Vue.use(Vuex)

let store = new Vuex.Store({
        modules: {
                func,
                role,
                classroom,
                dictionary,
        },
        state: {
                http
        },
        getters: {},
        mutations: {},
        actions: {}
})

export default  store;