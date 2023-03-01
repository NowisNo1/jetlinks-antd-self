import request from '@/utils/request';

export async function _search(data?: any) {
  return request(`/jetlinks/geo/object/_search`, {
    method: 'POST',
    data,
  });
}

export async function _search_page(data?: any) {
  return request(`/jetlinks/geo/object/_search/_page`, {
    method: 'POST',
    data,
  });
}
export async function _search_device_info(data?: any) {
  return request(`/jetlinks/device-instance/_query`, {
    method: 'GET',
    data,
  });
}
export async function _search_geo_point_json(data?: any) {
  return request('/jetlinks/device/location/tags',{
    method: 'GET',
    data,
  });
}
export async function _search_geo_json(data?: any) {
  return request(`/jetlinks/device/location/geo/object/_search/geo.json`, {
    method: 'POST',
    data,
  });
}

export async function saveByGeoJson(data?: any) {
  return request(`/jetlinks/device/location/geo/object/geo.json`, {
    method: 'POST',
    data: data,
  });
}

export async function _delete(id: any) {
  return request(`/jetlinks/geo/object/${id}`, {
    method: 'DELETE',
  });
}
