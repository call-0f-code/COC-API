import { describe } from 'node:test';
import { createProject  , getProjectById , updateProjects , deleteProjects , getMembersByProjectId , addMembers , removeMembers} from '../src/controllers/project.controller';
import * as projectService from '../src/services/project.service';
import { ApiError } from '../src/utils/apiError';

// modify the respose Object

   const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

// test for create Project routes

describe('createProjectHandler', () => {
  const AdminId = "4037653b-a434-460f-8a81-ca8cb46375aa";

 

  it('should return 200 and created project with valid input', async () => {
    const req: any = {
      body: {
        name: 'EventHub',
        imageUrl: 'https://example.com/image.png',
        githubUrl: 'https://github.com/example/eventhub',
        deployUrl: 'https://eventhub.example.com',
        AdminId,
      },
      
    };

    const res = mockRes();

    const mockProject = {
      id: 1,
      name: 'EventHub',
      imageUrl: req.body.imageUrl,
      githubUrl: req.body.githubUrl,
      deployUrl: req.body.deployUrl,
      createdById: AdminId,
      createdAt: new Date(),
      updatedById: null,
      updatedAt: new Date(),
    };

    jest
      .spyOn(projectService, 'createProject')
      .mockResolvedValue(mockProject);

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProject);
  });

  it('should throw an error if project name is missing', async () => {
    const req: any = {
      body: {
        name: '', // Invalid input
        imageUrl: 'https://example.com/image.png',
        githubUrl: 'https://github.com/example/eventhub',
        deployUrl: 'https://eventhub.example.com',
         AdminId,
      },
     
    };

    const res = mockRes();

    await expect(createProject(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });
});


// test for get project based on projecId

describe('getProjectByprojectId' , () => {
   const AdminId = "4037653b-a434-460f-8a81-ca8cb46375aa";

  
    
  it('should return 200 if project with Project Id exits', async () => {
    const req: any = {
      body : {  AdminId },
      params :{
          projectId : "1"
      } 
    };

    const res = mockRes();

    const mockProject = {
     id: 1,
    name:" my-project",
    imageUrl:" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxXnC3fwMwkbIt3ejGRIw3NmbDyUtgS5g2jA&s",
    githubUrl: "https://github.com/samrth07",
    deployUrl: "https://github.com/samrth07/Sportify",
    createdById: "4037653b-a434-460f-8a81-ca8cb46375aa",
    createdAt: new Date(),
    updatedById: AdminId,
    updatedAt: new Date(),

    };

    jest
      .spyOn(projectService, 'getProjectById')
      .mockResolvedValue(mockProject);

    await getProjectById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProject);
  });

   it('should return 400 if projectID id not given ', async () => {
    const req: any = {
      body : { AdminId },
      params :{
      } 
    };

      const res = mockRes();

    await expect(getProjectById(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


});


// test for the project Update Route


describe(' uodateProjectInfo ' , () => {
   const AdminId = "4037653b-a434-460f-8a81-ca8cb46375aa";

   
    
  it('should return 200 if project with Project Id exits', async () => {
    const req: any = {
      body : {  
        name : "Sporify",
        updatedById : "4037653b-a434-460f-8a81-ca8cb46375aa"
       },
      params :{
          projectId : "1"
      } 
    };

    const res = mockRes();

    const mockProject = {
     id: 1,
    name:"Sporify",
    imageUrl:" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxXnC3fwMwkbIt3ejGRIw3NmbDyUtgS5g2jA&s",
    githubUrl: "https://github.com/samrth07",
    deployUrl: "https://github.com/samrth07/Sportify",
    createdById: "4037653b-a434-460f-8a81-ca8cb46375aa",
    createdAt: new Date(),
    updatedById : "4037653b-a434-460f-8a81-ca8cb46375aa",
    updatedAt: new Date(),
    };

    jest
      .spyOn(projectService, 'updateProjects')
      .mockResolvedValue(mockProject);

    await updateProjects(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProject);
  });

  it('should return 400 if updatedById is not given ', async () => {
      const req: any = {
      body : {  
        name : "Sporify",
       },
      params :{
          projectId : "1"
      } 
    };

      const res = mockRes();

    await expect(updateProjects(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });

   it('should return 400 if projectId is not given ', async () => {
      const req: any = {
      body : {  
        name : "Sporify",
        updatedById : "4037653b-a434-460f-8a81-ca8cb46375aa"

       },
      params :{
         
      } 
    };

      const res = mockRes();

    await expect(updateProjects(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });
});

// test for delete project Routes 

describe(' deleteProjectRoutes ' , () => {

 
    
  it('should return 200 if project deleted ', async () => {
    const req: any = {

      params :{
          projectId : "1"
      } 
    };

    const res = mockRes();

    const mockProject = {
     id: 1,
    name:"Sporify",
    imageUrl:" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxXnC3fwMwkbIt3ejGRIw3NmbDyUtgS5g2jA&s",
    githubUrl: "https://github.com/samrth07",
    deployUrl: "https://github.com/samrth07/Sportify",
    createdById: "4037653b-a434-460f-8a81-ca8cb46375aa",
    createdAt: new Date(),
    updatedById : "4037653b-a434-460f-8a81-ca8cb46375aa",
    updatedAt: new Date(),
    };

    jest
      .spyOn(projectService, 'deleteProjects')
      .mockResolvedValue(mockProject);

    await deleteProjects(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProject);
  });

  it('should return 400 if projectId is not given ', async () => {
      const req: any = {
      params :{
      } 
    };

      const res = mockRes();

    await expect(deleteProjects(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


});


// test for getMemberByprojectsId Routes

describe(' getMembersByProjectId' , () => {
   const AdminId = "4037653b-a434-460f-8a81-ca8cb46375aa";

  
    
  it('should return 200 if member are enroll in projects', async () => {
    const req: any = {
      params :{
          projectId : "1"
      } 
    };

    const res = mockRes();

   const mockMembers = [
  { memberId: "725f05b6-8053-4610-80c2-9e48c9d27b9e", projectId: 1 },
  { memberId: "725f05b6-8053-4610-80c2-9e48c9d27b9e", projectId: 1 }
];


    jest
      .spyOn(projectService, 'getMembersByProjectId')
      .mockResolvedValue(mockMembers);

    await getMembersByProjectId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockMembers);
  });

   it('should return 400 if projectID id not given ', async () => {
    const req: any = {
      params :{
    
      } 
    };

      const res = mockRes();

    await expect(getMembersByProjectId(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


});


// test for the addmember routes


describe(' addMembers ' , () => {

   
    
  it('should return 200 if member added ', async () => {
    const req: any = {
      body : {
        memberId : ["725f05b6-8053-4610-80c2-9e48c9d27b9e"]
      },
      params :{
          projectId : "1"
      } 
    };

    const res = mockRes();

    const mockBatchPayload = {
  count: 1, // number of members added
};


    jest
      .spyOn(projectService, 'addMembers')
      .mockResolvedValue(mockBatchPayload);

    await addMembers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBatchPayload);
  });

  it('should return 400 if memberData is empty ', async () => {

      const req: any = {
        body :{
          memberId : []
        },
      params :{
        projectId : 1
      } 
    };

      const res = mockRes();

    await expect(addMembers(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


  it('should return 400 if projectId is empty ', async () => {

      const req: any = {
        body :{
          memberId : ["725f05b6-8053-4610-80c2-9e48c9d27b9e"]
        },
      params :{
       
      } 
    };

      const res = mockRes();

    await expect(addMembers(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


});



// Test for removeMembers Routes


describe(' removeMembers ' , () => {


    
  it('should return 200 if member deleted ', async () => {
    const req: any = {
      body : {
        memberId : ["725f05b6-8053-4610-80c2-9e48c9d27b9e"]
      },
      params :{
          projectId : "1"
      } 
    };

    const res = mockRes();

    const mockBatchPayload = {
    memberId : "725f05b6-8053-4610-80c2-9e48c9d27b9e",
    projectId : 1
};


    jest
      .spyOn(projectService, 'removeMembers')
      .mockResolvedValue(mockBatchPayload);

    await removeMembers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockBatchPayload);
  });

  it('should return 400 if memberId is empty ', async () => {

      const req: any = {
        body :{
       
        },
      params :{
        projectId : 1
      } 
    };

      const res = mockRes();

    await expect(removeMembers(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


  it('should return 400 if projectId is empty ', async () => {

      const req: any = {
        body :{
          memberId : ["725f05b6-8053-4610-80c2-9e48c9d27b9e"]
        },
      params :{

      } 
    };

      const res = mockRes();

    await expect(removeMembers(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


});


