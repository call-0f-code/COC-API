
import { prismaMock } from '../singleton';
import { Project } from '../src/generated/prisma';
import { createProject } from '../src/services/project.service';

describe('createProject', () => {
  it('should create a new project and return it', async () => {
    // input for service 
    const projectInput = {
      name: 'EventHub',
      imageUrl: 'https://example.com/image.png',
      githubUrl: 'https://github.com/example/eventhub',
      deployUrl: 'https://eventhub.example.com',
    };
    //expected output from service 
    const mockCreatedProject: Project = {
      id: 1,
      name: 'EventHub',
      imageUrl: 'https://example.com/image.png',
      githubUrl: 'https://github.com/example/eventhub',
      deployUrl: 'https://eventhub.example.com',
    };
    //this stops the call from doing to database and returns the value as resolved promise
    prismaMock.project.create.mockResolvedValue(mockCreatedProject);

    // gets the result of the service 
    const result = await createProject(projectInput);


    expect(prismaMock.project.create).toHaveBeenCalledWith({
      data: projectInput,
    });
    expect(result).toEqual(mockCreatedProject);
  });
});

