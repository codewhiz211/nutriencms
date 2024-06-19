export enum CrmLotTrigger {

    //*********************Sale**************************
    // Stage
    SaleHederSubmit = "stgwflmkcrminprocess",
    Inprocessfinalize = "stgwflmkcrmfinalised",
    InprocessInvoice = "stgwflmkcrminvoiced",

    //State
    InprocessState = "sttinprocesspreprocessing",
    FinalisedCompleteState = "sttfinalisedcomplete",
    FinalisedReverseState = "sttfinalisedreversed",
    InvoicedProcessingState = "sttinvoicedprocessing",

    //Trigger
    TrgPreprocessingNext = "trgrpreprocessingnext",
    TrgrPreprocessingInvoiceSale = "trgrinvoicedfinalisesale",
    TrgrPreprocessingFinaliseSale = "trgrpreprocessingfinalisesale",
    TrgPreprocessingRevers = "trgpreprocessingrevers",
    TrgrPreprocessingCalculate = "trgrpreprocessingcalculate",
    

    //*********************Lot**************************
    // Stage
    StgWFLmklotInProcess = "stgwflmklotinprocess",
    StgWFLmkLotClosed = "stgwflmklotclosed",

    //State
    SttLotInProcessPreprocessing = "sttlotinprocesspreprocessing",
    SttLotInprocessCalculate = "sttlotinprocesscalculate",
    
    //Trigger
    TrgrLotPreprocessingCreateLot = "trgrlotpreprocessingcreatelot",
    trgrlotpreprocessinglotsave = "trgrlotpreprocessinglotsave"

}
