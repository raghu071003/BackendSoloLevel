export const options ={
    httpOnly:true,
    secure: process.env.Prod === true,
    sameSite: 'None',
}