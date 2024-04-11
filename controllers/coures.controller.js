
import Course from "../models/course.model.js"
import AppError from "../utils/appError.js"
import cloudinary from 'cloudinary'
import fs from 'fs'

const getAllCourses = async(req, res, next) => {
    try{
        const courses = await Course.find({}).select('-lectures')
        res.status(200).json({
            success: true,
            message: 'All Courses',
            courses
        })
    }
    catch(e) {
        return next(
            AppError(e.message, 500)
        )
    }
}


const getLecturesById = async (req, res, next) => {
    try {
        const { courseId } = req.params
        const course = await Course.findById(courseId)

        if(!course) { 
            return next(
                new AppError('Invvalid course Id', 400)
            )
        }
        res.status(200).json({
            success: true,
            message: 'Course lecture fetch successsfully',
            lectures: course.lectures
        })

    }
    catch(e) {
        return next(
            new AppError(e.message, 500)
        )
    }
}

const createCourse = async (req,res, next) => {
    try {
        
        const { title, description, category, createdBy } = req.body

        if( !title || !description || !category || !createdBy){
            return next (new AppError('All fields are required!!!', 400))
        }

        const course = await Course.create({
            title,
            description, 
            category, 
            createdBy,
            thumbnail:{
                public_id: 'dummy',
                secure_url: 'dummy'
            }
        })

        if(req.file){
            const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: 'lms'})

            if(result){
                course.thumbnail.public_id = result.public_id
                course.thumbnail.secure_url = result.secure_url
            }
            fs.rm(`uploads/${req.file.filenname}`, () => {})
        }

        await course.save()

        res.status(200).json({
            success: true,
            message: 'Course Created Successfully',
            course
        })


    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }
}


const updateCourse = async (req,res, next) => {
    try {
        
        const {courseId} = req.params

        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: req.body
            },
            {
                runValidator: true
            }
            
        )

        if(!course) {
            return  next(new AppError('Course does not exist', 400))
        }

        res.status(200).json({
            success: true,
            message: 'Course Updated Successfully',
            course
        })

    } catch (e) {
        return next(

            new AppError(e.message, 500)
        )
    }
}


const deleteCourse = async (req,res, next) => {
    try {
        
        const {courseId} = req.params

        const course = await Course.findById(courseId)
        if(!course) {
            return next(
                new AppError('Course does not exist with given id', 500)
            )
        }

        await Course.findByIdAndDelete(courseId)

        res.status(200).json({
            success: true,
            message: 'Course Deleted Successfully'
        })

    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }
}



const addLectureToCourseById = async (req,res,next) => {

    try {

        const {title,description}= req.body
        const {courseId} = req.params

        if(!title || !description){
            return next(
                new AppError('All fiels are required', 500)
            )
        }

        const course = await Course.findById(courseId)
        if(!course){
            return next(
                new AppError('Course not exist by this given Id', 400)
            )
        }

        const lectureData = {
            title,
            description,
            lecture: {}
        }
        
        if(req.file){
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            })

            if(result){
                lectureData.lecture.public_id = result.public_id
                lectureData.lecture.secure_url = result.secure_url
            }

            fs.rm(`uploads/${req.file.filenname}`, () => {})
        }

        course.lectures.push(lectureData)
        course.numberOfLectures = course.lectures.length

        await course.save()

        res.status(200).json({
            success: true,
            message: 'Lecture added successfully!',
            course
        })

    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }

}

const deleteLecture = async (req,res, next) => {
    try {
        const { courseId, lectureId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return next(
                new AppError('Course not found with the provided ID', 400)
            );
        }

        const lectureIndex = course.lectures.findIndex(
            lecture => lecture._id == lectureId
        );

        if (lectureIndex === -1) {
            return next(
                new AppError('Lecture not found with the provided ID', 400)
            );
        }

        course.lectures.splice(lectureIndex, 1);

        course.numOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture deleted successfully',
            course
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}



export{
    getAllCourses,
    getLecturesById,
    createCourse,
    updateCourse,
    deleteCourse,
    addLectureToCourseById,
    deleteLecture

}