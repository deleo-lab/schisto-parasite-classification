# Parasite Image Dataset for Schistosomiasis Research

## Introduction
Schistosomiasis is a neglected tropical disease (NTD) infecting over 250 million people worldwide. The current approach to mitigate this disease is to deliver the drugs to treat needed communities. However, parasites are primarily transmitted through environment reservoirs where freshwater snails serve as intermediate hosts. People use the contaminated water source for their daily tasks and get re-infected after the drug treatment. Therefore, drug administration alone is not effective for Schistosomiasis control. Recent studies [1, 2] show that snail population control is essential to spot disease transmission risks. To discerning between human parasitic worms and other non-human parasitic species in snails is a necessary step to precise quantification of human risk. As part of Stanford's [Program for Disease Ecology, Health and the Environment](https://ecohealthsolutions.stanford.edu/), our team has collected 5,140 images of parasitic cercariae, from 11 morphospecies liberated from the Biomphalaria and Bulinus spp. snails encountered and dissected, in Senegal Africa during 2015-2018. This dataset is made public for the research community.

Our research team have used these images as training dataset to develop an AI-powered computer vision model that classifies images of 11 parasite categories with higher accuracy than well-trained human parasitologists. Details of this classification model can be found in the publication [3] and the code is available on our [Github repository](https://github.com/deleo-lab/schisto-snail-parasite-classification). In addition, by working with IBM's Cognitive Open Technologies & Performance Group, we have built a Javascript web application that incorporates with our classification model, which allows users to upload their own parasite images and the classification model will provide prediction suggestion for your parasite images. The web application is located [here](http://standord.xxx).

## Summary of Numbers of Images for Parasite Species
HS: 1008
NHS1: 638
NHS2: 107
AM: 442
BO: 224
EC: 332
GY: 152
ME: 196
PP: 806
PT: 231
XI: 1004

Abbreviations of parasite classes as follow, HS: Human-schisto, NHS1: Nonhuman- schisto forktail type I, NHS2: Nonhuman- schisto forktail type II, AM: Amphistome, BO: Bovis, EC: Echino, GY: Gymno, ME: Metacerc, PP: Parapleurolophocercous, PT: Parthenitae, XI-Xiphidiocercariae.

## Data Sharing License
The data sharing license associated with this project is CDLA-Permissive (Community Data License Agreement – Permissive – Version 1.0). The details of the license agreement can be found [here](https://cdla.io/permissive-1-0/) ([PDF version](https://cdla.io/permissive-1-0/wp-content/uploads/sites/52/2017/10/CDLA-Permissive-v1.0.pdf)). The CDLA-Permissive agreement is similar to permissive open source licenses in that the publisher of data allows anyone to use, modify and do what they want with the data with no obligations to share any of their changes or modifications.

## References
[1] Sokolow SH, Wood CL, Jones IJ, Swartz SJ, Lopez M, Hsieh MH, Lafferty KD, Kuris AM, Rickards C, De Leo GA. Global assessment of schistosomiasis control over the past century shows targeting the snail intermediate host works best. PLoS neglected tropical diseases. 2016 Jul 21;10(7):e0004794.
[2] Sokolow SH, Huttinger E, Jouanard N, Hsieh MH, Lafferty KD, Kuris AM, Riveau G, Senghor S, Thiam C, N’Diaye A, Faye DS. Reduced transmission of human schistosomiasis after restoration of a native river prawn that preys on the snail intermediate host. Proceedings of the National Academy of Sciences. 2015 Aug 4;112(31):9650-5.
[3] Liu ZY-C, Chamberlin AJ, Shome P, Jones IJ, Riveau G, Jouanard N, Ndione, Sokolow SH, De Leo GA. Snail and Parasite Image Classification using Deep Convolutional Neural Networks: Application to Human Schistosomiasis Environmental Risk Monitoring. PLoS neglected tropical diseases. 2019 (submitted).

## Contact
achamb@stanford.edu; zacycliu@stanford.edu or ssokolow@stanford.edu

## Last updated
June 6, 2019
