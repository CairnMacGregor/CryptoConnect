const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const profile = require('../../models/Profile');
const user = require('../../models/User');
const post = require('../../models/Post')
const { check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const normalize = require('normalize-url');
const User = require('../../models/User');
// ROUTE  = GET = api/profile/me
// DESC = GET LOGGED IN USERS PROFILE
// PRIVATE
router.get('/me', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id}).populate('user', ['name', 'avatar']);
        if(!profile){
            return res.status(400).json({ msg: "There is no profile for this user"});
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

// ROUTE  = POST = api/profile
// DESC = CREATE/UPDATE A USER PROFILE
// PRIVATE

router.post('/', [auth, [
        check('status', 'Status is required')
        .not()
        .isEmpty(),
        check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
],
async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
  


    

    const{
        profilePicture,
        handle,
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;
    const userName = await User.findById(req.user.id)
    
    const profileFields = {};
    profileFields.user = req.user.id;

    if(!handle) profileFields.handle = userName.name
    if(profilePicture) profileFields.profilePicture = profilePicture;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(handle) profileFields.handle = handle;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

   // Build socialFields object
   const socialFields = { youtube, twitter, instagram, linkedin, facebook };

   // normalize social fields to ensure valid url
   for (const [key, value] of Object.entries(socialFields)) {
     if (value && value.length > 0)
       socialFields[key] = normalize(value, { forceHttps: true });
   }
   // add to profileFields
   profileFields.social = socialFields;




    try {
        let profile = await Profile.findOne({ user: req.user.id});
       
        if(profile){
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id},
                { $set: profileFields }, 
                {new: true, upsert: true, setDefaultsOnInsert: true});
                return res.json(profile);
        }

        profile = new Profile (profileFields);

        await profile.save();

        res.json(profile)
        
        

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

// ROUTE  = GET = api/profile
// DESC = GET ALL PROFILEs
// PUBLIC

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// ROUTE  = GET = api/profile/user/:user_id
// DESC = GET PROFILE BY USER ID
// PUBLIC

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id}).populate('user', ['name', 'avatar']);

        if(!profile) 
        return res.status(400).json({ msg: 'Profile not found'});
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile not found'});
        }
        res.status(500).send("Server Error")
    }
});

// ROUTE  = DELETE = api/profile
// DESC = DELETE PROFILE, USER AND POSTS
// PRIVATE

router.delete('/', auth, async (req, res) => {
    try {

        await Post.deleteMany({user: req.user.id});


        await Profile.findOneAndRemove( { user: req.user.id });
        // REMOVE USER
        await User.findOneAndRemove( { _id: req.user.id });
        res.json( {msg: 'User Deleted'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// ROUTE  = PUT = api/profile/experience
// DESC = ADD PROFILE EXPERIENCE
// PRIVATE

router.put('/experience', [auth, 
    check('title', 'Title is required')
    .not()
    .isEmpty(),
    check('company', 'Company is required')
    .not()
    .isEmpty(),
    check('from', 'From date is required')
    .not()
    .isEmpty()

], async(req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json( { errors: errors.array()});
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne( ({ user: req.user.id}));
        profile.experience.unshift(newExp);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// ROUTE  = DELETE = api/profile/experience/:exp_id
// DESC = DELETE PROFILE EXPERIENCE
// PRIVATE

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne( ({ user: req.user.id}));
        
        // FIND CORRECT EXP
        const removeIndex = profile.experience.map( item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});
// =============

// ROUTE  = PUT = api/profile/education
// DESC = ADD PROFILE EDUCATION
// PRIVATE

router.put('/education', [auth, 
    check('school', 'School is required')
    .not()
    .isEmpty(),
    check('fieldofstudy', 'Field of study is required')
    .not()
    .isEmpty(),
    check('from', 'From date is required')
    .not()
    .isEmpty()

], async(req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json( { errors: errors.array()});
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne( ({ user: req.user.id}));
        profile.education.unshift(newEdu);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// ROUTE  = DELETE = api/profile/education/:edu_id
// DESC = DELETE PROFILE EDUCATION
// PRIVATE

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne( ({ user: req.user.id}));
        
        // FIND CORRECT EXP
        const removeIndex = profile.education.map( item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
});

// ROUTE  = GET = api/profile/user/user:id/followers
// DESC = GET ALL FOLLOWERS BY PROFILE
// PUBLIC

router.get('/user/:user_id/followers', async(req, res) =>{

    try {
        const profile = await Profile.findOne( ({ user: req.params.user_id}));

        
        res.json(profile.followers)
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }

})

// ROUTE  = GET = api/profile/user/user:id/following
// DESC = GET ALL FOLLOWING BY PROFILE
// PUBLIC

router.get('/user/:user_id/following', async(req, res) =>{

    try {
        const profile = await Profile.findOne( ({ user: req.params.user_id}));

       
        res.json(profile.following)
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }

})


// ROUTE  = PUT = api/profile/follow/:id
// DESC = FOLLOW A USER BY ID
// PRIVATE

router.put('/follow/:id', auth, async (req, res) =>{

        // CODE TO FOLLOW ANOTHER PROFILE
    try {
        const currentProfile = await Profile.findOne( ({ user: req.user.id})).populate('user', ['name']);
        const toFollowProfile = await Profile.findOne(({ user: req.params.id})).populate('user', ['name']);
        // console.log("This is the logged in profile" + currentProfile)
        // console.log("This is the to follow profile" + toFollowProfile)
        if (req.user.id === req.params.id) {
            return res.status(400).json({ alreadyfollow : "You cannot follow yourself"})
        } 
      
        if(currentProfile.following.filter(following => following.user.toString() === req.params.id).length > 0){
            return res.status(400).json({ msg: 'Already followed'})
        }
      
        const toFollow = ({
            name: toFollowProfile.user.name,
            profile: toFollowProfile,
            user: req.params.id,
        })
            currentProfile.following.unshift(toFollow)
        await currentProfile.save()
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

    //CODE TO ADD THE PERSON THAT FOLLOWED TO THE FOLLOWING ARRAY
    try {
        const currentProfile = await Profile.findOne( ({ user: req.user.id})).populate('user', ['name']);
        const toFollowProfile = await Profile.findOne(({ user: req.params.id})).populate('user', ['name']);

    
        const followed = ({
            name: currentProfile.user.name,
            profile: currentProfile,
            user: req.user.id,
        })
         toFollowProfile.followers.unshift(followed)
        await toFollowProfile.save()
        
     
        // 
        res.json(toFollowProfile.followers); 
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

    
    
});


// ROUTE  = PUT = api/profile/unfollow/:id
// DESC = UNFOLLOW A USER BY ID
// PRIVATE

router.put('/unfollow/:id', auth, async (req, res) =>{
    console.log("Unfollow route")
    try {
        const profile = await Profile.findOne( ({ user: req.user.id}));
        if (req.user.id === req.params.id) {
            return res.status(400).json({ alreadyfollow : "You don't follow this user"})
        } 
      
        if(profile.following.filter(following => following.user.toString() === req.params.id).length === 0){
            return res.status(400).json({ msg: "You don't follow this user"})
        }
    
        // res.json(profile) returns the logged in user
       
        // req.user.id = LOGGED IN USER
        // req.params.id = SEARCHED FOR USER
        
        const removeIndex = profile.following.map( following => following.user.toString()).indexOf(req.user.id);

        profile.following.splice(removeIndex, 1);

        await profile.save();

        res.json(profile.following);

        // HANDLE UNFOLLOWING 

        const followedProfile = await Profile.findOne({user:req.params.id})

        const removeIndex2 = followedProfile.followers.map( followers => followers.user.toString()).indexOf(req.user.id);

        followedProfile.followers.splice(removeIndex2, 1);
        await followedProfile.save()
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }



});

module.exports = router;