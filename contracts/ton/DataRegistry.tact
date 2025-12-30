import "@stdlib/deploy";

struct ProjectData {
  projectId: Int as uint64;
  name: String;
  description: String;
  owner: Address;
  totalFunds: Int as coins;
  allocatedFunds: Int as coins;
  createdAt: Int as uint32;
  status: Int as uint8;
}

struct SubtaskData {
  subtaskId: Int as uint64;
  projectId: Int as uint64;
  title: String;
  assignedTo: Address;
  amount: Int as coins;
  status: Int as uint8;
}

message StoreProject {
  name: String;
  description: String;
  owner: Address;
  totalFunds: Int as coins;
}

message StoreSubtask {
  projectId: Int as uint64;
  title: String;
  assignedTo: Address;
  amount: Int as coins;
}

message ChangeOwner {
  newOwner: Address;
}

contract DataRegistry with Deployable {
  owner: Address;
  projects: map<Int, ProjectData>;
  subtasks: map<Int, SubtaskData>;
  projectCounter: Int as uint64 = 0;
  subtaskCounter: Int as uint64 = 0;
  
  init(owner: Address) {
    self.owner = owner;
  }
  
  receive(msg: StoreProject) {
    require(sender() == self.owner, "Only owner can store data");
    
    self.projectCounter = self.projectCounter + 1;
    self.projects.set(self.projectCounter, ProjectData{
      projectId: self.projectCounter,
      name: msg.name,
      description: msg.description,
      owner: msg.owner,
      totalFunds: msg.totalFunds,
      allocatedFunds: 0,
      createdAt: now(),
      status: 0
    });
  }
  
  receive(msg: StoreSubtask) {
    require(sender() == self.owner, "Only owner can store data");
    
    self.subtaskCounter = self.subtaskCounter + 1;
    self.subtasks.set(self.subtaskCounter, SubtaskData{
      subtaskId: self.subtaskCounter,
      projectId: msg.projectId,
      title: msg.title,
      assignedTo: msg.assignedTo,
      amount: msg.amount,
      status: 0
    });
  }

  receive(msg: ChangeOwner) {
    require(sender() == self.owner, "Only owner can change ownership");
    self.owner = msg.newOwner;
  }

  
  get fun getProject(projectId: Int): ProjectData? {
    return self.projects.get(projectId);
  }
  
  get fun getSubtask(subtaskId: Int): SubtaskData? {
    return self.subtasks.get(subtaskId);
  }
  
  get fun getProjectCount(): Int {
    return self.projectCounter;
  }
  
  get fun getSubtaskCount(): Int {
    return self.subtaskCounter;
  }
}
