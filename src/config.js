const contentTypes = [{ label: '指定消除', content: '{}' }]

const columns = [
  {
    label: 'ID',
    prop: 'id',
    type: 'number',
    addDisplay: false,
    editDisabled: true
  },
  {
    label: 'parentId',
    prop: 'parentId',
    type: 'number',
    hide: true,
    addDisabled: true,
    editDisabled: true
  },
  {
    label: '创建者',
    prop: 'createdBy',
    type: 'input',
    addDisplay: false,
    hide: true,
    editDisabled: true
  },
  {
    label: '关卡ID',
    prop: 'levelId',
    type: 'number',
    editDisabled: true,
    addDisabled: false,
    formslot: true
  },
  {
    label: 'content',
    prop: 'content',
    type: 'radio',
    hide: true,
    valueDefault: contentTypes[0].content,
    editDisplay: false, formslot: true

  },
  {
    label: '描述',
    prop: 'description',
    type: 'input',
    rules: { required: true, message: '描述不能为空' }
  }
]

export { contentTypes, columns }
