import request from '@/utils/request'

export function createLevel(data) {
  return request({
    url: 'api/levelMap/create',
    method: 'post',
    data
  })
}

export function changeLevelId(id, levelId) {
  return request({
    url: 'api/levelMap/changeLevelId',
    method: 'post',
    params: { id, levelId }
  })
}

export function getAllLevel(data) {
  return request({
    url: 'api/levelMap',
    method: 'get'
  })
}

export function getAllLevelNoContent(filter) {
  const params = {
    'fields[levelMap]': 'contentMd5,createdBy,createdDate,deleted,description,lastModified,lastModifiedBy,levelId,lockedBy,parentId,sort'
  }
  if (filter) {
    params['filter[levelMap]'] = filter
  }
  return request({
    url: 'api/json/levelMap',
    method: 'get',
    params
  })
}

export function updateLevelIdAndDescription(id, levelId, description) {
  return request({
    url: 'api/levelMap/updateLevelIdAndDescription',
    method: 'post',
    data: {
      id, description, levelId
    }
  })
}

export function deleteLevelMap(ids) {
  return request({
    url: 'api/levelMap/delete',
    method: 'post',
    data: ids
  })
}

export function move(ids, moveTo, parentId) {
  return request({
    url: 'api/levelMap/move',
    method: 'post',
    data: { ids, moveTo, parentId }
  })
}

