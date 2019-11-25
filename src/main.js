import Vue from 'vue'
import App from './App.vue'
import Avue from '@smallwei/avue'
import '@smallwei/avue/lib/index.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
Vue.use(Avue)
Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
