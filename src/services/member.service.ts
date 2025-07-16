import { client } from '../db/client'
import dotenv from 'dotenv';
import path from 'path';
import { ApiError } from '../utils/apiError';

interface UpdateMemberPayload {
  name?: string;
  phone?: string;
  bio?: string;
  profilePhoto?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  geeksforgeeks?: string;
  leetcode?: string;
  codechef?: string;
  codeforces?: string;
  passoutYear?: string;
  isApproved?: boolean;
}


export const checkAdmin = async(adminId: string) => {
    return await client.member.findUnique({
        where: {
            id: adminId,
            isManager: true
        },
    })
}


export const approvedMembers = async () => {
  
    return await client.member.findMany({
        where: {
            isApproved: true
        }
    })

};

export const getDetails = async(memberId: string) => {
    return await client.member.findUnique({
        where: {
            id: memberId
        }
    })
}

export const createMember = async(
        email: string, 
        name: string, 
        password: string,
        passoutYear: number
    ) => {
        const newMember =  await client.member.create ({
            data: {
                email: email,
                name: name, 
                passoutYear: new Date(passoutYear),
            },
        })

        await client.account.create({
            data: {
            provider: "credentials",
            providerAccountId: email,
            password: password,     
            memberId: newMember.id
            }
        });

        return newMember;
}


export const updateMember = async(id:string, payload: UpdateMemberPayload) => {

    const { name, ...rest } = payload
    const member =  await client.member.findUnique({
        where: {
            id: id
        }
    })

    if(!member) {
        throw new ApiError('Member not found', 404);
    }

    const dataToUpdate = Object.fromEntries(
        Object.entries(rest).filter(([_, v]) => v !== undefined)
    );

    return await client.member.updateMany({
        where: { id },
        data: dataToUpdate,
    });
}

export const unapprovedMembers = async() => {
    return await client.member.findMany ({
        where: {isApproved: false}
    })
}

export const approveRequest = async(isApproved: boolean, adminId: string, memberId: string) => {

    const admin = await checkAdmin(adminId);
    console.log(admin);

    if(!admin) throw new ApiError('Forbidden access', 403)

    return await client.member.update({
        where: { id: memberId },
        data: {
            isApproved: isApproved
        }
    })
}

export const getAchievements = async(id: string) => {
    return await client.achievement.findMany({
        where: {
            members: {
                some: {
                    memberId: id
                }
            }
        }
    })
}

export const getProjects = async(id: string) => {
    return await client.project.findMany({
        where: {
            members: {
                some: {
                    memberId: id
                }
            }
        }
    })
}

export const getInterviews = async(id: string) => {
    return await client.interviewExperience.findMany({
        where:{memberId: id}
    })
}
