import request from '@/utils/request';
import { RuleInstanceItem } from './data.d';

export async function list(params?: any) {
  return request(`/jetlinks/rule-engine/instance/_query`, {
    method: 'GET',
    params,
  });
}

export async function listNoPaging(params?: any) {
  return request(`/jetlinks/rule-engine/instance/_query/no-paging`, {
    method: 'GET',
    params,
  });
}

export async function saveOrUpdate(params: RuleInstanceItem) {
  return request(`/jetlinks/rule-engine/instance/`, {
    method: 'PATCH',
    data: params,
  });
}

export async function info(id: string) {
  return request(`/jetlinks/rule-engine/instance/${id}`, {
    method: 'GET',
  });
}

export async function remove(id: string) {
  return request(`/jetlinks/rule-engine/instance/${id}`, {
    method: 'DELETE',
  });lnpm
}

export async function start(id: string) {
  return request(`/jetlinks/rule-engine/instance/${id}/_start`, {
    method: 'POST',
  });
}

export async function stop(id: string) {
  return request(`/jetlinks/rule-engine/instance/${id}/_stop`, {
    method: 'POST',
  });
}

export async function startDeviceAlarm(id: string) {
  return request(`/jetlinks/device/alarm/${id}/_start`, {
    method: 'POST',
  });
}

export async function stopDeviceAlarm(id: string) {
  return request(`/jetlinks/device/alarm/${id}/_stop`, {
    method: 'POST',
  });
}

export async function startScene(id: string) {
  return request(`/jetlinks/rule-engine/scene/${id}/_start`, {
    method: 'POST',
  });
}

export async function stopScene(id: string) {
  return request(`/jetlinks/rule-engine/scene/${id}/_stop`, {
    method: 'POST',
  });
}

export async function createModel(params: RuleInstanceItem) {

  return request(`/jetlinks/rule-engine/model`, {
    method: 'POST',
    data: params,
  });
}

export async function log(id: string, params: any) {
  return request(`/jetlinks/rule-engine/instance/${id}/logs`, {
    method: 'GET',
    params,
  });
}

export async function event(id: string, params: any) {
  return request(`/jetlinks/rule-engine/instance/${id}/events`, {
    method: 'GET',
    params,
  });
}

export async function node(id: string, params: any) {
  // 此处有修改 2023-02-28
  // window.open(`/jetlinks/rule-engine/instance/${id}/nodes`);
  return request(`/jetlinks/rule-engine/instance/${id}/nodes`, {
    method: 'GET',
    params,
  });
}

export async function create(params: any) {
  console.log("RuleInstanceItem -> ", params);
  // 此处有修改 2023-02-28
  return request(`/jetlinks/rule-engine/instance/create`, {
    method: 'POST',
    data: params
  });

  // return request(`/jetlinks/rule-engine/flow/_create`, {
  //   method: 'POST',
  //   data: params
  // });
}

export async function mycustom(id: String, params: any) {
  const opts = {
    "nodes": [],
    "info": params.info,
    "disabled": false,
    "env": [],
    "label": params.label
  };

  return request(`http://127.0.0.1:8001/red/flow`, {
    method: 'POST',
    data: opts
  })
}
