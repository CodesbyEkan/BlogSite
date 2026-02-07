import { getPosts } from "./getData.js";

export const filterPosts = async(req, res)=>{
    const postId = req.params.id;
    const toNumber = Number(postId)
    
    try {
        const data = await getPosts();
        
        const filtered = data.find((dataItem)=>{
            return dataItem.id === toNumber;
        })
        if(!filtered){
            return res.status(404).json({msg:"No item match..."})
        }        
        return res.status(200).json(filtered)
    } catch (error) {
        return res.status(404).json({msg:"No item match..."})   
    }
}
  