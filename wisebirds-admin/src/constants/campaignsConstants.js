import {deepFreeze} from '@/utils/functions/useJsUtils.js';

export const CAMPAIGNS_OBJECTIVE_CODE = deepFreeze({
  WEBSITE_CONVERSIONS: "WEBSITE_CONVERSIONS",
  WEBSITE_TRAFFIC: "WEBSITE_TRAFFIC",
  SALES: "SALES",
  APP_INSTALLATION: "APP_INSTALLATION",
  LEAD: "LEAD",
  BRAND: "BRAND",
  VIDEO_VIEWS: "VIDEO_VIEWS",
});

export const CAMPAIGNS_OBJECTIVE_NAME = deepFreeze({
  WEBSITE_CONVERSIONS: "웹사이트 전환",
  WEBSITE_TRAFFIC: "웹사이트 트래픽",
  SALES: "판매",
  APP_INSTALLATION: "앱설치",
  LEAD: "리드",
  BRAND: "브랜드 인지도 및 도달 범위",
  VIDEO_VIEWS: "동영상 조회",
});