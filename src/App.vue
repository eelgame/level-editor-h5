<template>
  <div id="app">
    <avue-crud ref="crud" :option="option" :data="data" @row-update="addUpdate">
      <template slot="menuLeft">
        <el-button size="small" @click="addRow">
          添加10条
        </el-button>
      </template>
    </avue-crud>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  }, data() {
    return {
      data: [{
        id: 0,
        name: '张三',
        sex: 1,
        $cellEdit: true
      }, {
        id: 1,
        name: '李四',
        sex: 0
      }],
      option: {
        keyId: 'id',
        addBtn: false,
        editBtn: false,
        addRowBtn: true,
        cellBtn: true,
        column: [{
          label: '姓名',
          prop: 'name',
          cell: true,
          rules: [
            {
              required: true,
              message: '请输入姓名',
              trigger: 'blur'
            }
          ]
        }, {
          label: '性别',
          prop: 'sex',
          type: 'select',
          dicData: [{
            label: '男',
            value: 0
          }, {
            label: '女',
            value: 1
          }],
          cell: true
        }, {
          label: '开关',
          prop: 'switch',
          type: 'switch',
          cell: true
        }]
      }
    }
  },
  methods: {
    addUpdate(form, index, done, loading) {
      this.$message.success('模拟网络请求')
      setTimeout(() => {
        this.$message.success('关闭按钮等待')
        loading()
      }, 1000)
      setTimeout(() => {
        this.$message.success(
          '编辑数据' + JSON.stringify(form) + '数据序号' + index
        )
        done()
      }, 2000)
    },
    addRow() {
      this.$message.success('正在添加，请稍后')
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          this.$refs.crud.rowCellAdd({
            name: ''
          })
        }
      }, 500)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
