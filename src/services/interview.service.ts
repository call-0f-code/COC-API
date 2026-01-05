import prisma from "../db/client";


export const getInterviews = async (page: number = 1, limit: number = 10, verdict : string = "All") => {
  const skip = (page - 1) * limit;

  const where : any = {}
  if(verdict !== "All"){
    where.verdict = verdict
  }

  const [interviews, total] = await Promise.all([
    prisma.interviewExperience.findMany({
      where,
      skip,
      take: limit,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    }),

    prisma.interviewExperience.count({where}),
  ]);

  const formattedInterviews = interviews.map(
    ({ isAnonymous, member, memberId, ...rest }) => {
      return isAnonymous ? {...rest,isAnonymous} : { ...rest,isAnonymous, member }; 
    }
  );

  return { interviews : formattedInterviews , total };
};


export const getInterviewById = async (interviewId: number) => {
  return await prisma.interviewExperience.findUnique({
    where: {
      id: interviewId,
    },
  });
};

export const createInterview = async (memberId: string, interviewData: InterviewCreateInput) => {
  const interview = await prisma.interviewExperience.create({
    data: {
      company: interviewData.company,
      role: interviewData.role,
      verdict: interviewData.verdict,
      content: interviewData.content,
      isAnonymous: interviewData.isAnonymous,
      memberId: memberId,
    },
  });

  return interview;
};

export const updateInterviewById = async (interviewId: number, updateData: InterviewUpdateInput) => {
  const { memberId, ...fieldsToUpdate } = updateData;

  const updatedInterview = await prisma.interviewExperience.update({
    where: {
      id: interviewId,
    },
    data: fieldsToUpdate,
  });

  return updatedInterview;
};

export const deleteInterviewById = async (interviewId: number) => {
  await prisma.interviewExperience.delete({
    where: {
      id: interviewId,
    },
  });
};


