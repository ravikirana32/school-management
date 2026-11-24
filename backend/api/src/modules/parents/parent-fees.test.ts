import { describe, expect, it } from "vitest";
import { calculateFeePayment } from "./parent-fees.js";
describe("calculateFeePayment",()=>{
 it("records a partial payment without floating point drift",()=>expect(calculateFeePayment("100.00","10.10","0.20")).toEqual({amountPaid:"10.30",status:"PARTIALLY_PAID"}));
 it("marks a fully paid charge",()=>expect(calculateFeePayment("50","25","25")).toEqual({amountPaid:"50.00",status:"PAID"}));
 it("rejects overpayment",()=>expect(calculateFeePayment("100","90","10.01")).toBeNull());
 it("rejects zero and negative payments",()=>{expect(calculateFeePayment(10,0,0)).toBeNull();expect(calculateFeePayment(10,0,-1)).toBeNull();});
 it("rejects invalid totals",()=>expect(calculateFeePayment("NaN",0,1)).toBeNull());
});
