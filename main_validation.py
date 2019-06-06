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
Main script for running the trained CNN model for validation dataset; no trainings performed.

See our method paper:
Liu ZY-C, Chamberlin AJ, Shome P, Jones IJ, Riveau G, Jouanard N, Ndione, Sokolow SH, 
De Leo GA. Snail and Parasite Image Classification using Deep Convolutional 
Neural Networks: Application to Human Schistosomiasis Environmental Risk Monitoring. 
PLoS neglected tropical diseases. 2019 (submitted).

Utility script:
model_validation.py: load preprocessed data, CNN architecture, model building, plot confusion matrix
plot_confusion_matrix.py: plot confusion matrix on the prediction results of test set

After running the main script, the accuracy and confusion matrix will be printed,
and the plots of training histroy and confusion matrix (results) will be generated. 

For questions, email: zacqoo@gmail.com 
"""

# ------------------------------------------------------------------------------ 
# import libraries and packages
from keras import applications  
from model_validation import model_validation
# ------------------------------------------------------------------------------ 
# define parameters
in_s = 64 # input image size 
img_width, img_height = in_s, in_s  
  
top_model_weights_path = 'bottleneck_fc_model.h5'  
train_data_dir = 'dataset/training_set'  
validation_data_dir = 'dataset/test_set'  
# number of epochs to train top model  
epochs = 40 
# batch size used by flow_from_directory and predict_generator  
batch_size = 32
# ------------------------------------------------------------------------------  
# create the VGG16 model - 
# without the final fully-connected layers (by specifying include_top=False) 
# - and load the ImageNet weights
model = applications.VGG16(include_top=False, weights='imagenet') 
# ------------------------------------------------------------------------------ 
# training
model_validation(img_width, img_height, top_model_weights_path, train_data_dir, 
	validation_data_dir, epochs, batch_size, model)

