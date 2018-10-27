const Directions = {
    NONE:0,
    UP:1,
    DOWN:2,
}
const OrderState = {
    NOT_ORDERED:1,
    ORDERED_NOT_ASSIGNED:2,
    ORDERED_AND_ASSIGNED:3
}
const Global = {
    SECONDS_PER_FLOOR:0.5
}

/* ElevatorMovementCoordinator interface - start */

function ElevatorMovementCoordinator(eElevator){
    this.iFrom=0;
    this.iTo=0;
    this.iFramesPerSecond=60;
    this.iFramesPerSecondInterval=this.iFramesPerSecond/1000;
    this.iFloorHeight=110;
    this.iNumOfSecondsBetweenAdjacentFloors=Global.SECONDS_PER_FLOOR;
    this.iTotalNumOfSeconds=0;
    this.iStartTimeStamp=null;
    this.iLastTimeStamp=null;
    this.eElevator=eElevator;
    this.iTotalDistanceToCover=0;
    this.iDistanceOnEachIteration=0;
}
ElevatorMovementCoordinator.prototype.move = function(iFrom,iTo){
    this.iFrom=iFrom;
    this.iTo=iTo;
    this.iTotalNumOfSeconds=Math.abs(iTo-iFrom)*this.iNumOfSecondsBetweenAdjacentFloors;
    this.iTotalDistanceToCover=Math.abs(iTo-iFrom)*this.iFloorHeight;
    this.iDistanceOnEachIteration=this.iTotalDistanceToCover/this.iTotalNumOfSeconds/this.iFramesPerSecond*(this.iTo>this.iFrom ? -1 : 1);
    this.iLastTimeStamp=null;
    this.iStartTimeStamp=Date.now();
    this.startAnimating();
}
ElevatorMovementCoordinator.prototype.startAnimating=function(){

    // calc elapsed time since last loop
    if (!this.iLastTimeStamp)this.iLastTimeStamp=Date.now();
    const iNow = Date.now(),iElapsed = iNow - this.iLastTimeStamp;
    // if allocated time elapsed then exit 
    if ((this.iLastTimeStamp-this.iStartTimeStamp)/1000<this.iTotalNumOfSeconds)requestAnimationFrame(()=>this.startAnimating());
    
    // if enough time has elapsed, draw the next frame
    if (iElapsed > this.iFramesPerSecondInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        this.iLastTimeStamp = iNow - (iElapsed % this.iFramesPerSecondInterval);

        // Put your drawing code here
        if (isNaN(parseFloat(this.eElevator.style.top)))this.eElevator.style.top="0";
		this.eElevator.style.top=parseFloat(this.eElevator.style.top)+this.iDistanceOnEachIteration+"px";
    }
}

/* ElevatorMovementCoordinator interface - end */

/* Elevator interface - start */

function Elevator(oFloorsManager){
    this.direction=Directions.NONE;
    this.iCurrentFloor=0;
    this.eElevator=null;
    this.arOrders=[];
    this.iDelaySteps=0;
    this.oFloorsManager=oFloorsManager;
    this.oElevatorMovementCoordinator= null;
}
Elevator.prototype.calcStepsToFloor = function(iFloorNum){
    let iSteps=0,iCurrentFloor=this.iCurrentFloor;
    for (let iOrder of this.arOrders){ 
        iSteps+=Math.abs(iOrder-iCurrentFloor)+4;
        iCurrentFloor=iOrder;
    }
    return iSteps+this.iDelaySteps+Math.abs(iFloorNum-iCurrentFloor);
}
Elevator.prototype.create = function(eParent){
    const eElevator=document.createElement("div");
    eElevator.classList.add("elevator");
    eParent.appendChild(eElevator);
    this.eElevator=eElevator;
    this.oElevatorMovementCoordinator= new ElevatorMovementCoordinator(eElevator);
}
Elevator.prototype.addOrder = function(iFloorNum){
    this.arOrders.push(iFloorNum);
    }
Elevator.prototype.recalcState = function(){
    if (this.iDelaySteps>0){
        this.iDelaySteps--;
    }
    else if (this.iCurrentFloor===this.arOrders[0]){
        this.oFloorsManager.arFloors[this.iCurrentFloor].orderState=OrderState.NOT_ORDERED;
        this.arOrders.splice(0,1);
        this.iDelaySteps=4;
        this.direction=Directions.NONE;
        this.oFloorsManager.arFloors[this.iCurrentFloor].eFloor.querySelector(".elevatorController").classList.remove("highlight");
        this.dingDong();
    }
    else if (this.arOrders.length>0){
        if (this.direction===Directions.NONE)this.oElevatorMovementCoordinator.move(this.iCurrentFloor,this.arOrders[0]);

        this.direction=this.arOrders[0]-this.iCurrentFloor>0 ? Directions.UP : Directions.DOWN;
        this.iCurrentFloor+=this.direction===Directions.UP ? 1 : -1;
    }
}
Elevator.prototype.dingDong = function(){
    this.eElevator.closest(".elevators").querySelector(".audioControl").play();
}

/* Elevator interface - end */

/* ElevatorsOrchestrator interface - start */

function ElevatorsOrchestrator(iElevatorsNum){
    this.iElevatorsNum=iElevatorsNum;
    this.arElevators=[];
}
ElevatorsOrchestrator.prototype.orchestrate = function(){
    for (let oElevator of this.arElevators){
            oElevator.recalcState();
    }
}
ElevatorsOrchestrator.prototype.addOrder = function(iFloorNum){
    //here you should write a perfect algorithm to find the most 
    // efficient (how i hat this word)
    // elevator. for now, i just choose the first victim.
    let oMVP = null,iStepsRemaining=0;

    for (let oElevator of this.arElevators){
        if (!oMVP || oMVP.calcStepsToFloor(iFloorNum)>oElevator.calcStepsToFloor(iFloorNum)){
            oMVP=oElevator;
        }
    }
    iStepsRemaining=oMVP.calcStepsToFloor(iFloorNum);
    oMVP.addOrder(iFloorNum);
    return iStepsRemaining;
}
ElevatorsOrchestrator.prototype.create = function(oFloorsManager,eFloors){
    for (let jj=0;jj<this.iElevatorsNum;jj++){
        const oElevator=new Elevator(oFloorsManager);
        oElevator.create(eFloors);
        this.arElevators.push(oElevator);
    }
}

/* ElevatorsOrchestrator interface - end */

/* FloorsManager interface - start */

function FloorsManager(iFloorsNum){
    this.arFloors=[];
    this.iFloorsNum=iFloorsNum;
}
FloorsManager.prototype.create = function(oElevatorsOrchestrator,eFloors){
    for (let jj=0;jj<this.iFloorsNum;jj++){
        const oFloor=new Floor(jj,oElevatorsOrchestrator);
        oFloor.create(eFloors);
        this.arFloors.push(oFloor);
    }
}

/* FloorsManager interface - end */


/* Floor interfacre - start */

function Floor(iFloorNum,oElevatorsOrchestrator){
    this.eFloor=null;
    this.orderState=OrderState.NOT_ORDERED;
    this.iFloorNum=iFloorNum;
    this.oElevatorsOrchestrator=oElevatorsOrchestrator;
    this.iSecRemaining=0;
}

Floor.prototype.create = function(eParent){
    const eFloor=document.createElement("div"),eController=document.createElement("button");
    const eRemainingTimeCounter = document.createElement("div");
    eFloor.classList.add("floor");
    eController.classList.add("metal","linear","elevatorController");
    eRemainingTimeCounter.classList.add("remainingTimeCounter","invisibleMe");
    eController.innerText=this.iFloorNum;
    eFloor.appendChild(eController);
    eFloor.appendChild(eRemainingTimeCounter);
    if (eParent.children.length===0){
        eParent.appendChild(eFloor);
    }else{
        eParent.insertBefore(eFloor,eParent.children[0]);
    }
    this.eFloor=eFloor;

    eController.addEventListener("click",e=>{
        if (this.orderState===OrderState.NOT_ORDERED){
            this.eFloor.querySelector(".elevatorController").classList.add("highlight");
            this.orderState=OrderState.ORDERED_NOT_ASSIGNED;
            this.iSecRemaining=this.oElevatorsOrchestrator.addOrder(this.iFloorNum)*Global.SECONDS_PER_FLOOR;
            const fShowRemainingSec = ()=>{
                if (this.iSecRemaining>0){
                    this.eFloor.querySelector(".remainingTimeCounter").classList.remove("invisibleMe");
                    this.eFloor.querySelector(".remainingTimeCounter").innerText=this.iSecRemaining;
                    this.iSecRemaining--;
                    window.setTimeout(fShowRemainingSec,1000);
                }
                else{
                    this.eFloor.querySelector(".remainingTimeCounter").classList.add("invisibleMe");
                }
            } 
            window.setTimeout(fShowRemainingSec,0);
        }
    })
}

/* Floor interfacre - end */


/* Building interface - start*/

function Building(iFloorsNum,iElevatorsNum){
    this.eBuilding=null;
    this.oElevatorsOrchestrator=new ElevatorsOrchestrator(iElevatorsNum);
    this.oFloorsManager = new FloorsManager(iFloorsNum);
    this.init(iFloorsNum,iElevatorsNum);
}
Building.prototype.coordinateElevators = function(){
    this.oElevatorsOrchestrator.orchestrate();
}
Building.prototype.create = function(){
    const eBuilding=document.createElement("div"),
        eFloors=document.createElement("div"),
        eElevators=document.createElement("div"),
        eAudio=document.createElement("audio"),
        eSource=document.createElement("source");
    eBuilding.classList.add("building");
    eFloors.classList.add("floors");
    eElevators.classList.add("elevators");
    eAudio.classList.add("audioControl");
    eSource.setAttribute("src","./audio/ding.mp3");
    eAudio.appendChild(eSource);
    eElevators.appendChild(eAudio);
    eBuilding.appendChild(eFloors);
    eBuilding.appendChild(eElevators);
    document.getElementById("eCityArea").appendChild(eBuilding);
    this.eBuilding=eBuilding;
    
    this.oFloorsManager.create(this.oElevatorsOrchestrator,eFloors);
    this.oElevatorsOrchestrator.create(this.oFloorsManager,eElevators)

}
Building.prototype.init = function(iFloorsNum){
    this.create();
}

/* Building interface - end*/

const oCity = {
    arBuildings:[],
    addBuilding(iFloorsNum,iElevatorsNum){
        this.arBuildings.push(new Building(iFloorsNum,iElevatorsNum));
    },
    dayBreak(){
        window.setInterval(()=>{
            for (let oBuilding of this.arBuildings){
                oBuilding.coordinateElevators();
            }
        },500)
    }
}