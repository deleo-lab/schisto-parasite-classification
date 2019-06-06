# MIT License

# Copyright (c) 2019 Otolith- Monterey Bay Aquarium- Conservation Research

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
# ==============================================================================
"""
Utility script for CNN model training setup.

1. process the data, utilizing keras flow_from_directory
2. set up CNN architecture with VGG16 pre-trained model, using Keras
3. training
4. save weights
5. make predictions for the test set
6. calculate and print accuracy and confusion matrix
7. plots: training history and confusion matrix

"""

def model_train(img_width, img_height, top_model_weights_path, train_data_dir, 
	validation_data_dir, epochs, batch_size, model):

	# import libraries and packages
	import numpy as np  
	from keras.preprocessing.image import ImageDataGenerator, img_to_array, load_img  
	from keras.models import Sequential  
	from keras.layers import Dropout, Flatten, Dense
	from keras.utils.np_utils import to_categorical  
	import matplotlib.pyplot as plt  
	import math  
	# ------------------------------------------------------------------------------  
	# create the data generator for training images, 
	# and run them on the VGG16 model to save the bottleneck features for training
	train_datagen = ImageDataGenerator(rescale= 1./255,
									shear_range = 0.2,
                                   	zoom_range = 0.2,
                                   	rotation_range=30, 
                                   	width_shift_range=0.2, 
                                   	height_shift_range=0.2, 
                                   	horizontal_flip = False)
   
	generator = train_datagen.flow_from_directory(  
    	train_data_dir,  
    	target_size=(img_width, img_height),  
    	batch_size=batch_size,  
    	class_mode=None,  
    	shuffle=False)  
  
	nb_train_samples = len(generator.filenames)  
	num_classes = len(generator.class_indices)  
  
	predict_size_train = int(math.ceil(nb_train_samples / batch_size))  
  
	bottleneck_features_train = model.predict_generator(  
    	generator, predict_size_train)  
  
	np.save('bottleneck_features_train.npy', bottleneck_features_train)
	# ------------------------------------------------------------------------------  
	# do the same for the validation data
	datagen = ImageDataGenerator(rescale= 1./255) 

	generator = datagen.flow_from_directory(  
     	validation_data_dir,  
     	target_size=(img_width, img_height),  
     	batch_size=batch_size,  
     	class_mode=None,  
     	shuffle=False)  
   
	nb_validation_samples = len(generator.filenames)  
  
	predict_size_validation = int(math.ceil(nb_validation_samples / batch_size))  
  
	bottleneck_features_validation = model.predict_generator(  
    	generator, predict_size_validation)  
  
	np.save('bottleneck_features_validation.npy', bottleneck_features_validation)
	# ------------------------------------------------------------------------------  
	# to train the top model, need the class labels for each of the training/validation samples 
	# also need to convert the labels to categorical vectors
	train_datagen_top = ImageDataGenerator(rescale= 1./255,
                                       	shear_range = 0.2,
                                       	zoom_range = 0.2,
                                       	rotation_range=30, 
                                       	width_shift_range=0.2, 
                                       	height_shift_range=0.2, 
                                       	horizontal_flip = False)

	generator_top = train_datagen_top.flow_from_directory(  
        	train_data_dir,  
        	target_size=(img_width, img_height),  
        	batch_size=batch_size,  
        	class_mode='categorical',  
        	shuffle=False)  
   
	nb_train_samples = len(generator_top.filenames)  
	num_classes = len(generator_top.class_indices)  
  
	# load the bottleneck features saved earlier  
	train_data = np.load('bottleneck_features_train.npy')  
  
	# get the class lebels for the training data, in the original order  
	train_labels = generator_top.classes  
  
	# convert the training labels to categorical vectors  
	train_labels = to_categorical(train_labels, num_classes=num_classes) 
	# ------------------------------------------------------------------------------  
	# do the same for validation features as well
	datagen_top = ImageDataGenerator(rescale=1./255)

	generator_top = datagen_top.flow_from_directory(  
         	validation_data_dir,  
         	target_size=(img_width, img_height),  
         	batch_size=batch_size,  
         	class_mode=None,  
         	shuffle=False)  
   
	nb_validation_samples = len(generator_top.filenames)  
  
	validation_data = np.load('bottleneck_features_validation.npy')  
  
	validation_labels = generator_top.classes  
	validation_labels = to_categorical(validation_labels, num_classes=num_classes)  
	# ------------------------------------------------------------------------------  
	# create and train a small fully-connected network - 
	# the top model - using the bottleneck features as input, with our classes as the classifier output
	model = Sequential()  
	model.add(Flatten(input_shape=train_data.shape[1:]))  
	model.add(Dense(256, activation='relu'))  
	model.add(Dropout(0.55))  
	model.add(Dense(num_classes, activation='softmax'))  
  
	model.compile(optimizer='rmsprop',  
             	loss='categorical_crossentropy', metrics=['accuracy'])  
  
	history = model.fit(train_data, train_labels,  
         	epochs=epochs,  
        	batch_size=batch_size,  
         	validation_data=(validation_data, validation_labels))  
  
	model.save_weights(top_model_weights_path)  
  
	(eval_loss, eval_accuracy) = model.evaluate(  
    	validation_data, validation_labels, batch_size=batch_size, verbose=1)

	print("[INFO] accuracy: {:.2f}%".format(eval_accuracy * 100))  
	print("[INFO] Loss: {}".format(eval_loss))

	# ------------------------------------------------------------------------------  
	# graph the training history
	plt.plot(history.history['loss'])  
	#plt.figure(1)  
   
 	# summarize history for accuracy  
   
	#plt.subplot(211)
	plt.figure(figsize=(8,5))  
	plt.plot(history.history['acc'])  
	plt.plot(history.history['val_acc'])  
	plt.title('Model Accuracy')  
	plt.ylabel('Accuracy',fontsize=14)  
	plt.xlabel('Epoch',fontsize=14)  
	plt.legend(['train', 'test'], loc='bottom right')
	plt.xticks(fontsize = 10)
	plt.yticks(fontsize = 10)
	plt.show()  
   
 	# summarize history for loss  
   
	#plt.subplot(212)
	plt.figure(figsize=(8,5))  
	plt.plot(history.history['val_loss'])  
	plt.xlabel('Epoch',fontsize=14)  
	plt.legend(['train', 'test'], loc='bottom right')  
	plt.title('Model Loss')  
	plt.ylabel('Loss',fontsize=14)  
	plt.xticks(fontsize = 10)
	plt.yticks(fontsize = 10) 
	plt.show()
	# ------------------------------------------------------------------------------
	model.load_weights(top_model_weights_path)
	pred = model.predict(validation_data,batch_size=batch_size,verbose=1)  
	# use the bottleneck prediction on the top model to get the final classification  
	class_predicted = model.predict_classes(validation_data)
	# get label for validation set
	test_label = generator_top.filenames

	from numpy import argmax
	# invert encoding
	val_labels = []
	for i in range(0,len(class_predicted)):
		val_labels.append(argmax(validation_labels[i]))

	from sklearn.metrics import confusion_matrix, accuracy_score
	cm = confusion_matrix(val_labels, class_predicted)
	acc = accuracy_score(val_labels, class_predicted)*100
	print(' ')
	print("Accuracy for validation set: " + str(acc) + "%")
	print(' ')
	# ------------------------------------------------------------------------------  
	# Plot confusion matrix
	class_names = [0,1,2,3,4,5,6,7,8,9,10]
	from plot_confusion_matrix import plot_confusion_matrix

	# Plot non-normalized confusion matrix
	import matplotlib.pyplot as plt
	plt.figure()
	plot_confusion_matrix(cm, classes=class_names,
    	                  title='Confusion matrix, without normalization')
	plt.savefig('cm.png')

	# Plot normalized confusion matrix
	plt.figure()
	plot_confusion_matrix(cm, classes=class_names, normalize=True,
    	                  title='Normalized confusion matrix')
	plt.savefig('cm_norm.png')

