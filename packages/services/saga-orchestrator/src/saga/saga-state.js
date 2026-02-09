"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaStatus = void 0;
var SagaStatus;
(function (SagaStatus) {
    SagaStatus["STARTED"] = "STARTED";
    SagaStatus["INVENTORY_RESERVED"] = "INVENTORY_RESERVED";
    SagaStatus["PAYMENT_AUTHORIZED"] = "PAYMENT_AUTHORIZED";
    SagaStatus["SHIPMENT_CREATED"] = "SHIPMENT_CREATED";
    SagaStatus["COMPLETED"] = "COMPLETED";
    SagaStatus["COMPENSATING"] = "COMPENSATING";
    SagaStatus["FAILED"] = "FAILED";
})(SagaStatus || (exports.SagaStatus = SagaStatus = {}));
