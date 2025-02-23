/** @namespace Campaign */
/**
 *  @typedef {
 *    'WEBSITE_CONVERSIONS'|
 *    'WEBSITE_TRAFFIC'|
 *    'SALES'|
 *    'APP_INSTALLATION'|
 *    'LEAD'|
 *    'BRAND'|
 *    'VIDEO_VIEWS'
 *  } Campaign.Objective - 캠페인 목적 코드 타입
 *
 *  WEBSITE_CONVERSIONS: "웹사이트 전환"
 *  WEBSITE_TRAFFIC: "웹사이트 트래픽"
 *  SALES: "판매"
 *  APP_INSTALLATION: "앱설치"
 *  LEAD: "리드"
 *  BRAND: "브랜드 인지도 및 도달 범위"
 *  VIDEO_VIEWS: "동영상 조회"
 */
/**
 *  @typedef {object} Campaign.Content
 *  @property {number} id - 캠페인 ID
 *  @property {string} name - 캠페인명
 *  @property {boolean} enabled - 상태 true | false
 *  @property {Campaign.Objective} campaign_objective - 캠페인 목적
 *  @property {number} impressions - 노출수
 *  @property {number} clicks - 클릭수
 *  @property {number} ctr - CTR
 *  @property {number} video_views - 비디오조회수
 *  @property {number} vtr - VTR
 */


