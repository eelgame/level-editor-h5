<template>
  <div id="app">
    <el-dialog :visible.sync="deleteDialog.visible" title="确定要删除以下关卡吗?">
      <avue-crud :data="deleteDialog.data" :option="deleteDialog.option" style="margin-top: -40px" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialog.visible = false">
          取 消
        </el-button>
        <el-button :v-loading="deleteDialog.btnLoading" type="primary" @click="del(deleteDialog.data)">
          确 定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="moveDialog.visible" title="确定要移动以下关卡吗?">
      <avue-crud
        ref="moveDialogCrud"
        :data="moveDialog.data"
        :option="moveDialog.option"
        style="margin-top: -40px"
      >
        <template slot="menu" slot-scope="scope">
          <el-radio v-model="moveDialog.selectParentId" :label="scope.row.id" />
        </template>
      </avue-crud>
      <el-divider />
      <el-form ref="moveDialogForm" label-position="right" label-width="80px">
        <el-form-item label="ID/LevelId">
          <el-select v-model="moveDialog.moveTo" clearable filterable>
            <el-option v-for="e in data" :key="e.id" :label="e.levelId ?e.id + '/' + e.levelId: e.id " :value="e.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="moveDialog.visible = false">
          取 消
        </el-button>
        <el-button :v-loading="moveDialog.btnLoading" type="primary" @click="move">
          确 定
        </el-button>
      </div>
    </el-dialog>

    <avue-crud
      ref="crud"
      :data="data"
      :option="option"
      :table-loading="tableLoading"
      @row-del="showDelDialog"
      @row-save="save"
      @row-update="addUpdate"
    >
      <template slot="levelIdForm" slot-scope="scope">
        <el-input v-model="scope.row.levelId" :disabled="scope.row.parentId" />
      </template>
      <template slot="menu" slot-scope="scope">
        <el-button
          v-if="!scope.row.parentId"
          :size="scope.size"
          :type="scope.type"
          icon="el-icon-plus"
          @click="addChild(scope.row)"
        >
          子关
        </el-button>
      </template>
      <template slot="contentForm" slot-scope="scope">
        <el-select v-model="scope.row.content">
          <el-option
            v-for="(item, index) in contentTypes"
            :key="index"
            :label="item.label"
            :value="item.content"
          />
        </el-select>
      </template>
      <template slot="menuLeft">
        <el-button icon="el-icon-delete" size="mini" type="warning" @click="showMoveSelect">
          移 动
        </el-button>
        <el-button icon="el-icon-delete" size="mini" type="danger" @click="showDelSelect">
          删 除
        </el-button>

        <el-radio-group v-model="filter" size="mini" @change="filterChange">
          <el-radio-button label="主线" />
          <el-radio-button label="测试" />
          <el-radio-button label="我的" />
        </el-radio-group>
      </template>
    </avue-crud>
  </div>
</template>
<style>
    .el-input-number .el-input__inner {
        text-align: left !important;
    }
</style>
<script>
import * as LevelMapApi from './api/levelMap'
import { columns, contentTypes } from './config'
import { user } from './api/login'
import { comparison, inList } from 'rsql-builder'
import dot from 'dot'
import Vue from 'vue'
import _ from 'lodash'

export default {
  name: 'App',
  components: {}, data() {
    return {
      data: [],
      filterConfig: [
        { name: '主线', value: 'levelId=isnull=false;deleted==false;parentId=isnull=true', children: true },
        { name: '测试', value: 'levelId=isnull=true;deleted==false;parentId=isnull=true', children: true },
        { name: '我的', value: 'createdBy==\'{{=it.user.account}}\';deleted==false', children: false }
      ],
      filter: '主线',
      deleteDialog: {
        btnLoading: false, visible: false, data: [], option: {
          border: true,
          addBtn: false, page: false,
          columnBtn: false,
          menu: false,
          refreshBtn: false,
          column: columns
        }
      },
      moveDialog: {
        selectParentId: null,
        moveTo: null,
        btnLoading: false, visible: false, data: [], option: {
          border: true,
          addBtn: false, page: false,
          columnBtn: false,
          menu: true,
          editBtn: false,
          delBtn: false,
          refreshBtn: false,
          column: columns
        }
      },
      tableLoading: false,
      contentTypes,
      option: {
        page: false, selection: true, size: 'mini',
        border: true,
        labelWidth: '80',
        keyId: 'id',
        addBtn: true,
        column: columns
      }
    }
  },
  computed: {},
  created() {
    user().then(res => {
      const user = res.data
      this.filterConfig.forEach(e => {
        e.value = dot.template(e.value)({ user: user })
      })
      this.refresh()
    }).catch(err => {
      this.$message({
        type: 'error',
        message: err,
        title: '获取用户信息失败'
      })
    })
  },
  methods: {
    async addChild(row) {
      try {
        const res = await LevelMapApi.createLevel({ parentId: row.id, description: '' })
        this.data.find(e => e.id === row.id).children.push(Object.assign({}, res.data))
        this.$message({
          type: 'success',
          message: '创建成功'
        })
      } catch (e) {
        this.$message({
          type: 'error',
          message: e,
          title: '创建失败'
        })
      }
    },
    filterValue() {
      return this.filterConfig.find(e => e.name === this.filter)
    },
    buildTableData(mapById) {
      const data = {}
      Object.values(mapById).filter(e => !e.attributes.parentId).forEach(e => {
        data[e.id] = Object.assign({}, e.attributes, { id: e.id, children: [] })
      })

      Object.values(mapById).filter(e => e.attributes.parentId).forEach(e => {
        const parent = data[e.attributes.parentId]
        if (parent) {
          parent.children.push(Object.assign({}, e.attributes, { id: e.id }))
        }
      })
      return Object.values(data)
    },

    async refresh() {
      const filter = this.filterValue()
      const mapById = {}
      this.tableLoading = true

      try {
        let res = await LevelMapApi.getAllLevelNoContent(filter.value)
        res.data.forEach(e => {
          Vue.set(mapById, e.id, e)
        })

        let list = Object.values(mapById).filter(e => e.attributes.parentId).map(e => e.attributes.parentId)
        if (list && list.length > 0) {
          res = await LevelMapApi.getAllLevelNoContent(comparison('id', inList(...list)))
          res.data.forEach(e => {
            Vue.set(mapById, e.id, e)
          })
        }

        if (filter.children) {
          list = Object.values(mapById).filter(e => !e.attributes.parentId).map(e => e.id)
          if (list && list.length > 0) {
            res = await LevelMapApi.getAllLevelNoContent(comparison('parentId', inList(...list)))
            res.data.forEach(e => {
              Vue.set(mapById, e.id, e)
            })
          }
        }
        this.data = this.buildTableData(mapById)
      } catch (e) {
        this.$message({
          type: 'error',
          message: filter + '\n' + e,
          title: '获取关卡信息失败'
        })
      }
      this.tableLoading = false
    },
    filterChange() {
      this.refresh()
    },
    showMoveSelect() {
      const tableSelect = _.cloneDeep(this.$refs.crud.tableSelect)
      tableSelect.forEach(e => {
        delete e.children
      })
      this.moveDialog.data = tableSelect
      this.moveDialog.visible = true
    },
    showDelSelect() {
      const tableSelect = _.cloneDeep(this.$refs.crud.tableSelect)
      tableSelect.forEach(e => {
        delete e.children
      })
      this.deleteDialog.data = tableSelect
      this.deleteDialog.visible = true
    },
    async move() {
      const moveDialog = this.moveDialog
      if (!moveDialog.moveTo && !moveDialog.selectParentId) {
        this.$alert('请选择父关卡')
        return
      }

      moveDialog.btnLoading = true
      try {
        await LevelMapApi.move(moveDialog.data.map(e => e.id), moveDialog.moveTo, moveDialog.selectParentId)
        moveDialog.btnLoading = false
        moveDialog.visible = false
        this.refresh()
      } catch (err) {
        moveDialog.btnLoading = false
        this.$message({
          type: 'error',
          message: err,
          title: '移动失败'
        })
      }
    },
    del(rows) {
      this.deleteDialog.btnLoading = true

      LevelMapApi.deleteLevelMap(rows.map(e => e.id)).then(res => {
        this.$message({
          type: 'success',
          message: '删除成功'
        })
        this.deleteDialog.visible = false
        this.deleteDialog.btnLoading = false
        this.refresh()
      })
    },
    showDelDialog(row, index) {
      const r = Object.assign({}, row)
      delete r.children
      this.deleteDialog.data = [r]
      this.deleteDialog.visible = true
    },
    findById(id) {
      console.log(id)
      for (const e of this.data) {
        /* eslint eqeqeq: "off", curly: "error" */
        if (e.id == id) {
          return e
        } else {
          if (e.children) {
            for (const child of e.children) {
              if (child.id == id) {
                return child
              }
            }
          }
        }
      }
      return null
    },
    addUpdate(form, index, done, loading) {
      LevelMapApi.updateLevelIdAndDescription(form.id, form.levelId, form.description).then(res => {
        console.log(this.findById(res.data.id))
        Object.assign(this.findById(res.data.id), res.data)
        loading()
        done()
        this.refresh()
      }).catch(err => {
        loading()
        this.$message({
          type: 'error',
          message: err,
          title: '更新失败'
        })
      })
    },
    save(row, done, loading) {
      LevelMapApi.createLevel(row).then(res => {
        loading()
        done()
        this.$message({
          type: 'success',
          message: '创建成功'
        })
        this.refresh()
      }).catch((err) => {
        loading()
        this.$message({
          type: 'error',
          message: err,
          title: '创建失败'
        })
      })
    }
  }
}
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin-top: 10px;
    }
</style>
