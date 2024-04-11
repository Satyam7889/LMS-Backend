import {Router} from 'express'
import { addLectureToCourseById, createCourse, deleteCourse, deleteLecture, getAllCourses, getLecturesById, updateCourse } from '../controllers/coures.controller.js'
import { authorizedRoles, authorizedSubscriber, isLoggedIn } from '../middleware/auth.middleware.js'
import upload from '../middleware/multer.middleware.js'

const courseRouter = Router()

courseRouter.get('/' , getAllCourses)
courseRouter.post('/' ,isLoggedIn,authorizedRoles('ADMIN') ,upload.single('thumbnail'), createCourse)

courseRouter.get('/:courseId', isLoggedIn, authorizedSubscriber, getLecturesById)
courseRouter.put('/:courseId',isLoggedIn,authorizedRoles('ADMIN') , updateCourse)
courseRouter.delete('/:courseId',isLoggedIn,authorizedRoles('ADMIN') , deleteCourse)
courseRouter.post('/:courseId',isLoggedIn,authorizedRoles('ADMIN') , upload.single('lecture'), addLectureToCourseById)
courseRouter.delete('/:courseId/:lectureId',isLoggedIn,authorizedRoles('ADMIN') , deleteLecture)


export default courseRouter