import { createProject  , getProjectById , updateProjects , deleteProjects
   , getMembersByProjectId , addMembers , removeMembers} from '../src/controllers/project.controller';
import * as projectService from '../src/services/project.service';
import { ApiError } from '../src/utils/apiError';
import { Response , Request} from 'express';
import * as imageUtils from '../src/utils/imageUtils';


jest.mock('../src/routes/projects', () => {
  return {
    __esModule: true,
    default: jest.fn(() => require('express').Router()),
  };
});


// modify the respose Object

   const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  // test for the createProject routes

describe('createProjectHandler', () => {
  const adminId = '4037653b-a434-460f-8a81-ca8cb46375aa';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and created project with valid input', async () => {
    const req = {
      body:{
        projectData : {
          name: 'EventHub',
          githubUrl: 'https://github.com/example/eventhub',
          deployUrl: 'https://eventhub.example.com',
          adminId,
      },
    },
      file: {
        mimetype: 'image/png',
        buffer: Buffer.from('fake-image-data'),
      },
    } as unknown as Request; 

    const res = mockRes();

    const mockProject = {
      id: 1,
      name: 'EventHub',
      imageUrl: 'https://fake-image-url.com/image.png',
      githubUrl: req.body.projectData.githubUrl,
      deployUrl: req.body.projectData.deployUrl,
      createdById: adminId,
      createdAt: new Date(),
      updatedById: null,
      updatedAt: new Date(),
    };

    jest.spyOn(projectService, 'createProject').mockResolvedValue(mockProject);

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProject);
  });

 it('should throw 400 if any required field is missing', async () => {
  const req = {
    body: {
      projectData : {
      githubUrl: 'https://github.com/example/eventhub',
      deployUrl: 'https://eventhub.example.com',
      adminId,
      // name is missing
    },
  },
    file: {
      mimetype: 'image/png',
      buffer: Buffer.from('fake-image-data'),
    },
  } as unknown as Request;

  const res = mockRes();

  await expect(createProject(req, res)).rejects.toThrow(ApiError);
});

});


// test for get project based on projecId

describe('getProjectByprojectId' , () => {
   const adminId = "4037653b-a434-460f-8a81-ca8cb46375aa";
    
  it('should return 200 if project with Project Id exits', async () => {
    const req: any = {
      body : {  adminId },
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
    updatedById: adminId,
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
      body : { adminId },
      params :{
      
      } 
    };

      const res = mockRes();

    await expect(getProjectById(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


});


// test for the project Update Route


describe(' updateProjectInfo ' , () => {
   const adminId = "4037653b-a434-460f-8a81-ca8cb46375aa";

   
    
  it('should return 200 if project with Project Id exits', async () => {
    const req: any = {
      body : {
        projectData :{  
            name : "Sporify",
            updatedById : "4037653b-a434-460f-8a81-ca8cb46375aa"
          }
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
        projectData :{  
            name : "Sporify"
          }
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
        projectData : {  
        name : "Sporify",
        updatedById : "4037653b-a434-460f-8a81-ca8cb46375aa"

       },
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


describe(' removeMembersFromProject ' , () => {


    
  it('should return 200 if member deleted ', async () => {
    const req: any = {

      params :{
          projectId : "1",
          memberId : ["725f05b6-8053-4610-80c2-9e48c9d27b9e"]
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
       
      params :{
        projectId : 1
      } 
    };

      const res = mockRes();

    await expect(removeMembers(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


  it('should return 400 if projectId is empty ', async () => {

      const req: any = {
      params :{
        memberId : ["725f05b6-8053-4610-80c2-9e48c9d27b9e"]
      } 
    };

      const res = mockRes();

    await expect(removeMembers(req, res)).rejects.toThrow(ApiError); // or a more specific message
  });


});


